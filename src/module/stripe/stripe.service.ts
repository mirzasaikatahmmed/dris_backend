import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/prisma/browser";
import { CartStatus, OrderType } from "prisma/generated/prisma/enums";
import Stripe from "stripe";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(private prisma: PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
    }

    async createProduct(name: string, description?: string) {
        return this.stripe.products.create({
            name,
            description,
        });
    }

    async createSubscriptionPrice(
        productId: string,
        amount: number,
        interval: "month" | "year"
    ) {
        return this.stripe.prices.create({
            product: productId,
            unit_amount: amount * 100, // Stripe uses cents
            currency: "usd",
            recurring: {
                interval,
            },
        });
    }

    updateProduct(productId: string, data: Stripe.ProductUpdateParams) {
        return this.stripe.products.update(productId, data);
    }

    async createPaymentIntent(amount: number, currency: string) {
        return this.stripe.paymentIntents.create({
            amount, // in smallest currency unit (e.g., cents)
            currency,
            payment_method_types: ["card"],
        });
    }

    async createCheckoutSession(data: {
        userId: string;
        cartId: string;
        customerNotes?: string;
        orderType?: string;
    }) {
        const cart = await this.prisma.cart.findFirst({
            where: {
                id: data?.cartId,
                userId: data?.userId,
                status: CartStatus.ACTIVE,
            },
            include: {
                items: {
                    include: { options: true, product: true, variant: true },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            throw new BadRequestException("Cart is empty or not found");
        }
        const lineItems = cart.items.map(item => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name:
                        item.product.name +
                        (item.variant ? ` (${item.variant.name})` : ""),
                },
                unit_amount: Math.round(
                    (item.lineTotal.toNumber() * 100) / item.quantity
                ),
            },
            quantity: item.quantity,
        }));

        // Add delivery fee, discount, etc. as separate lines if needed

        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            line_items: lineItems,
            success_url: `${process.env.CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/cart`,
            metadata: {
                cartId: cart.id,
                userId: data?.userId,
                restaurantId: cart.restaurantId,
                customerNotes: data?.customerNotes || "",
                orderType: data?.orderType || "PICKUP",
            },
            // customer_email: user.email,  // optional
        });

        return { sessionId: session.id, url: session.url };
    }

    async handleCheckoutSessionCompleted(event: Stripe.Event) {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.mode !== "payment" || session.payment_status !== "paid") {
            return; // not interested
        }

        const { cartId, userId, customerNotes, orderType } =
            session.metadata ?? {};

        if (!cartId) {
            console.warn("Missing cartId in metadata");
            return;
        }

        const result = await this.prisma.$transaction(async tx => {
            // Lock / find cart
            const cart = await tx.cart.findUnique({
                where: { id: cartId },
                include: {
                    items: {
                        include: {
                            options: { include: { group: true, item: true } },
                        },
                    },
                },
            });

            if (!cart) {
                console.warn(`Cart ${cartId} not found`);
                return;
            }

            if (cart.status !== CartStatus.ACTIVE) {
                console.warn(`Cart ${cartId} already processed`);
                return; // idempotent
            }

            // Create Order
            const order = await tx.order.create({
                data: {
                    userId: userId ?? null,
                    cartId: cart.id,
                    restaurantId: cart.restaurantId,
                    orderType: (orderType as OrderType) || "PICKUP", // ← from metadata / user input
                    status: "PENDING",
                    paymentStatus: "PAID",
                    paymentMethod: "stripe",
                    subtotal: cart.totalAmount,
                    deliveryFee: 0,
                    discountAmount: 0,
                    totalAmount: session.amount_total
                        ? new Prisma.Decimal(session.amount_total / 100)
                        : cart.totalAmount,
                    deliveryAddressId: null, // ← from metadata or user
                    customerNotes,
                    paymentIntent: session?.payment_intent as string,
                    // stripeCheckoutSessionId: session.id,
                },
            });

            console.log({ order });
            // Copy cart items → order items (snapshot)
            for (const ci of cart.items) {
                const oi = await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: ci.productId,
                        variantId: ci.variantId,
                        quantity: ci.quantity,
                        unitPrice: ci.unitPrice,
                        lineTotal: ci.lineTotal,
                    },
                });

                // Copy options (snapshot + names!)
                for (const co of ci.options) {
                    await tx.orderItemOption.create({
                        data: {
                            orderItemId: oi.id,
                            groupId: co.groupId,
                            itemId: co.itemId,
                            groupName: co.group.name || "Unknown",
                            itemName: co.item.name || "Unknown",
                            quantity: co.quantity,
                            unitPrice: co.unitPrice,
                            lineTotal: co.lineTotal,
                        },
                    });
                }
            }

            // Mark cart as completed / archive
            await tx.cart.update({
                where: { id: cart.id },
                data: { status: CartStatus.CHECKED_OUT }, // add this enum value if needed
            });
            return order;
            // Optional: send email, notify restaurant, etc.
        });
        console.log({ result });
    }
}
