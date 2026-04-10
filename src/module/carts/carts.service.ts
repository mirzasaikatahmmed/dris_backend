import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { dec0, toDecimal } from '../../common/helpers/money';
import { AddToCartDto, ChangeCartItemQuantityDto } from './dto/add-to-cart.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CartStatus } from 'prisma/generated/prisma/enums';
import { Decimal } from '@prisma/client/runtime/index-browser';

@Injectable()
export class CartsService {
  constructor(private prisma: PrismaService) {}

  

  private async computeCartItemPricing(
    tx: PrismaService,
    productId: string,
    variantId?: string,
    options?: { itemId: string; quantity: number }[],
  ) {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isAvailable)
      throw new BadRequestException('Product not available');

    let basePrice = dec0();

    if (variantId) {
      const v = await tx.productVariant.findUnique({
        where: { id: variantId },
      });
      if (!v || v.productId !== productId)
        throw new BadRequestException('Invalid variant for product');
      if (!v.isAvailable)
        throw new BadRequestException('Variant not available');
      basePrice = v.price;
    }

    const selected = options ?? [];
    let extrasTotal = dec0();

    if (selected.length) {
      const optionIds = selected.map((o) => o.itemId);
      const dbOptions = await tx.modifierOption.findMany({
        where: { id: { in: optionIds }, isActive: true },
        include: { group: true },
      });

      if (dbOptions.length !== optionIds.length)
        throw new BadRequestException('One or more modifier options invalid');

      for (const sel of selected) {
        const opt = dbOptions.find((x) => x.id === sel.itemId)!;
        extrasTotal = extrasTotal.plus(opt.price.mul(sel.quantity));
      }
    }

    return { basePrice, extrasTotal };
  }

  private async findMatchingCartItem(
    tx: PrismaService,
    cartId: string,
    dto: AddToCartDto,
  ): Promise<{ id: string; quantity: number; lineTotal: Decimal } | null> {
    const candidates = await tx.cartItem.findMany({
      where: {
        cartId,
        productId: dto.productId,
        variantId: dto.variantId ?? null,
      },
      include: {
        options: {
          select: {
            groupId: true,
            itemId: true,
            quantity: true,
          },
        },
      },
    });

    // Normalize incoming options for comparison
    const incomingKey = this.getOptionsKey(
      dto.options?.map((o) => ({
        groupId: o.groupId,
        itemId: o.itemId,
        quantity: o.quantity ?? 1,
      })) ?? [],
    );

    for (const item of candidates) {
      const existingKey = this.getOptionsKey(item.options);
      if (incomingKey === existingKey) {
        return {
          id: item.id,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        };
      }
    }

    return null;
  }

  // Creates a deterministic string key for comparing sets of options
  private getOptionsKey(
    options: { groupId: string; itemId: string; quantity: number }[],
  ): string {
    const sorted = [...options].sort((a, b) => {
      if (a.groupId !== b.groupId) return a.groupId.localeCompare(b.groupId);
      return a.itemId.localeCompare(b.itemId);
    });

    return sorted
      .map((o) => `${o.groupId}:${o.itemId}:${o.quantity}`)
      .join('|');
  }

  private async getOrCreateActiveCart(
    tx: PrismaService,
    restaurantId: string,
    userId?: string,
  ) {
    let cart = await tx.cart.findFirst({
      where: {
        restaurantId,
        userId: userId ?? null,
        status: CartStatus.ACTIVE,
      },
    });

    if (!cart) {
      cart = await tx.cart.create({
        data: {
          restaurantId,
          userId: userId ?? null,
          status: CartStatus.ACTIVE,
          totalAmount: dec0(),
        },
      });
    }

    return cart;
  }

  private async recalculateCartTotal(tx: PrismaService, cartId: string) {
    const sum = await tx.cartItem.aggregate({
      where: { cartId },
      _sum: { lineTotal: true },
    });

    await tx.cart.update({
      where: { id: cartId },
      data: { totalAmount: sum._sum.lineTotal ?? dec0() },
    });
  }

  private async getFullCart(tx: PrismaService, cartId: string) {
    return tx.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            options: true,
            product: true,
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  // ─── Quantity change helpers ─────────────────────────────────────────────

  private async updateItemQuantity(
    tx: PrismaService,
    itemId: string,
    newQuantity: number,
  ) {
    if (newQuantity <= 0) {
      await tx.cartItemOption.deleteMany({ where: { cartItemId: itemId } });
      await tx.cartItem.delete({ where: { id: itemId } });
      return null; // item removed
    }

    const item = await tx.cartItem.findUnique({
      where: { id: itemId },
      include: { options: { select: { itemId: true, quantity: true } } },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    // Re-compute current pricing
    const { basePrice, extrasTotal } = await this.computeCartItemPricing(
      tx,
      item.productId,
      item.variantId ?? undefined,
      item.options.map((o) => ({ itemId: o.itemId, quantity: o.quantity })),
    );

    const unitPrice = basePrice;
    const lineTotal = basePrice.plus(extrasTotal).mul(newQuantity);

    await tx.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity, unitPrice, lineTotal },
    });

    return item.cartId;
  }

  async addToCart(dto: AddToCartDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const cart = await this.getOrCreateActiveCart(
        tx as any,
        dto.restaurantId,
        userId,
      );

      const requestedQty = dto.quantity ?? 1;

      // 1. Try to find existing matching item
      const existing = await this.findMatchingCartItem(tx as any, cart.id, dto);

      let updatedItemId: string;

      const { basePrice, extrasTotal } = await this.computeCartItemPricing(
        tx as any,
        dto.productId,
        dto.variantId,
        dto.options?.map((o) => ({
          itemId: o.itemId,
          quantity: o.quantity ?? 1,
        })),
      );

      const unitPrice = basePrice;
      const itemTotalWithoutQty = basePrice.plus(extrasTotal);

      if (existing) {
        // 2. Update existing item
        const newQuantity = existing.quantity + requestedQty;
        const newLineTotal = itemTotalWithoutQty.mul(newQuantity);

        await tx.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: newQuantity,
            lineTotal: newLineTotal,
          },
        });

        updatedItemId = existing.id;
      } else {
        // 3. Create new item
        const lineTotal = itemTotalWithoutQty.mul(requestedQty);

        const newItem = await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: dto.productId,
            variantId: dto.variantId ?? null,
            quantity: requestedQty,
            unitPrice,
            lineTotal,
          },
        });

        updatedItemId = newItem.id;

        // Create cart item options
        if (dto.options?.length) {
          const optionIds = dto.options.map((o) => o.itemId);
          const dbOptions = await tx.modifierOption.findMany({
            where: { id: { in: optionIds } },
          });

          await tx.cartItemOption.createMany({
            data: dto.options.map((o) => {
              const opt = dbOptions.find((x) => x.id === o.itemId)!;
              const q = o.quantity ?? 1;
              const up = opt.price;
              return {
                cartItemId: newItem.id,
                groupId: o.groupId,
                itemId: o.itemId,
                quantity: q,
                unitPrice: up,
                lineTotal: up.mul(q),
              };
            }),
          });
        }
      }

      // 4. Recalculate cart total
      const sum = await tx.cartItem.aggregate({
        where: { cartId: cart.id },
        _sum: { lineTotal: true },
      });

      const newTotal = sum._sum.lineTotal ?? dec0();

      await tx.cart.update({
        where: { id: cart.id },
        data: { totalAmount: newTotal },
      });

      // 5. Return updated cart
      return tx.cart.findUnique({
        where: { id: cart.id },
        include: {
          items: {
            include: {
              options: true,
              product: true,
              variant: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  async getActiveCart(restaurantId: string, userId?: string) {
    const cart = await this.prisma.cart.findFirst({
      where: {
        restaurantId,
        userId: userId ?? null,
        status: CartStatus.ACTIVE,
      },
      include: {
        items: {
          include: { options: true, product: true, variant: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!cart) throw new NotFoundException('Active cart not found');
    return cart;
  }

  async removeItem(cartItemId: string) {
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({ where: { id: cartItemId } });
      if (!item) throw new NotFoundException('Cart item not found');

      await tx.cartItemOption.deleteMany({ where: { cartItemId } });
      await tx.cartItem.delete({ where: { id: cartItemId } });

      const sum = await tx.cartItem.aggregate({
        where: { cartId: item.cartId },
        _sum: { lineTotal: true },
      });

      await tx.cart.update({
        where: { id: item.cartId },
        data: { totalAmount: sum._sum.lineTotal ?? dec0() },
      });

      return tx.cart.findUnique({
        where: { id: item.cartId },
        include: {
          items: {
            include: { options: true, product: true, variant: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });
    });
  }

  async increaseItemQuantity(
    cartItemId: string,
    dto: ChangeCartItemQuantityDto,
    userId: string,
  ) {
    const amount = dto.amount ?? 1;

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        select: { cartId: true, quantity: true },
      });

      if (!item) throw new NotFoundException('Cart item not found');

      // Optional: verify cart belongs to user
      const cart = await tx.cart.findUnique({
        where: { id: item.cartId },
        select: { userId: true },
      });

      if (cart?.userId !== userId) {
        throw new BadRequestException('Cart does not belong to this user');
      }

      const newQty = item.quantity + amount;

      await this.updateItemQuantity(tx as any, cartItemId, newQty);

      await this.recalculateCartTotal(tx as any, item.cartId);

      return this.getFullCart(tx as any, item.cartId);
    });
  }

  async decreaseItemQuantity(
    cartItemId: string,
    dto: ChangeCartItemQuantityDto,
    userId: string,
  ) {
    const amount = dto.amount ?? 1;

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        select: { cartId: true, quantity: true },
      });

      if (!item) throw new NotFoundException('Cart item not found');

      const cart = await tx.cart.findUnique({
        where: { id: item.cartId },
        select: { userId: true },
      });

      if (cart?.userId !== userId) {
        throw new BadRequestException('Cart does not belong to this user');
      }

      const newQty = item.quantity - amount;

      await this.updateItemQuantity(tx as any, cartItemId, newQty);

      await this.recalculateCartTotal(tx as any, item.cartId);

      return this.getFullCart(tx as any, item.cartId);
    });
  }
}
