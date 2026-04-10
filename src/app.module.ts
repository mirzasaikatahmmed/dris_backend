// AppModule
import { Module } from "@nestjs/common";

import { AuthModule } from "./module/auth/auth.module";
import { PrismaModule } from "./module/prisma/prisma.module";
import { SeederService } from "./seed/seed.service";
import { TwilioModule } from "./module/twilio/twilio.module";
import { MailModule } from "./module/mail/mail.module";
import { ScheduleModule } from "@nestjs/schedule";
import { ConfigModule } from "@nestjs/config";
import { StripeModule } from "./module/stripe/stripe.module";
import { RestaurentModule } from "./module/restaurent/restaurent.module";
import { CategoriesModule } from "./module/categories/categories.module";
import { MenuModule } from "./module/menu/menu.module";
import { AllergensModule } from "./module/allergens/allergens.module";
import { ModifiersModule } from "./module/modifiers/modifiers.module";
import { ProductsModule } from "./module/products/products.module";
import { CartsModule } from "./module/carts/carts.module";
import { OrdersModule } from "./module/orders/orders.module";
import { WebhookModule } from "./module/webhook/webhook.module";
import { DriversModule } from "./module/drivers/drivers.module";
import { FavoritesModule } from "./module/favorites/favorites.module";
import { LightspeedAuthModule } from "./module/lightspeed-auth/lightspeed-auth.module";
import { LightspeedMenusModule } from "./module/lightspeed-menus/lightspeed-menus.module";
import { LightspeedBusinessModule } from "./module/lightspeed-business/lightspeed-business.module";
import { LightspeedTokenModule } from "./module/lightspeed-token/lightspeed-token.module";
import { LightspeedOrderConfigModule } from "./module/lightspeed-order-config/lightspeed-order-config.module";
import { LightspeedOrdersModule } from "./module/lightspeed-orders/lightspeed-orders.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // Makes ConfigService available everywhere
            envFilePath: ".env", // Ensure this points to your file
        }),
        AuthModule,
        PrismaModule,
        TwilioModule,
        MailModule,
        ScheduleModule.forRoot(),
        StripeModule,
        RestaurentModule,
        CategoriesModule,
        MenuModule,
        AllergensModule,
        ModifiersModule,
        ProductsModule,
        CartsModule,
        OrdersModule,
        WebhookModule,
        DriversModule,
        FavoritesModule,
        LightspeedAuthModule,
        LightspeedMenusModule,
        LightspeedBusinessModule,
        LightspeedTokenModule,
        LightspeedOrderConfigModule,
        LightspeedOrdersModule,
    ],
    providers: [SeederService],
})
export class AppModule {}
