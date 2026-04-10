import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as express from "express";
import { join } from "path";
import { ValidationPipe } from "@nestjs/common";
import { PrismaService } from "./module/prisma/prisma.service";
import { readFileSync } from "fs";

import { RolesGuard } from "./common/guard/roles.guard";
import { JwtAuthGuard } from "./common/guard/jwt.guard";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use("/webhooks", express.raw({ type: "application/json" }));

    app.use("/uploads", express.static(join(process.cwd(), "uploads")));
    app.use("/", express.static(join(process.cwd(), "public")));

    // Swagger setup
    const config = new DocumentBuilder()
        .setTitle("Dris API")
        .setDescription("API documentation for Dris Project")
        .setVersion("1.0")
        .addBearerAuth()
        .addSecurityRequirements("bearer")
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customCss: readFileSync(
            join(process.cwd(), "src/swagger-dark.css"),
            "utf8"
        ),
    });

    const reflector = app.get(Reflector);
    // app.useGlobalInterceptors(new TransformInterceptor(reflector));
    const prisma = app.get(PrismaService);

    app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            skipUndefinedProperties: true,
        })
    );

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
