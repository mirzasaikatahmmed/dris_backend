import { Module } from "@nestjs/common";
import { StripeService } from "./stripe.service";
import { StripeController } from "./stripe.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
    providers: [StripeService],
    controllers: [StripeController],
    exports: [StripeService],
    imports: [PrismaModule],
})
export class StripeModule {}
