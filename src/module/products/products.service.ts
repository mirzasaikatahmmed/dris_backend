import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toDecimal } from '../../common/helpers/money';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AddVariantDto } from './dto/add-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const isProductExist = await this.prisma.product.findFirst({
      where: {
        name: dto.name,
        categoryId: dto.categoryId,
      },
    });
    if (isProductExist)
      throw new BadRequestException('Product already exists in this category');
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          restaurantId: dto.restaurantId,
          categoryId: dto.categoryId,
          name: dto.name,
          description: dto.description,
          imageUrl: dto.imageUrl,
          isAvailable: dto.isAvailable ?? true,
          displayOrder: dto.displayOrder ?? 0,
          externalId: dto.externalId,
        },
      });

      if (dto.ingredients?.length) {
        await tx.productIngredient.createMany({
          data: dto.ingredients.map((item) => ({
            productId: product.id,
            name: item.name,
            isRemovable: item.isRemovable || false,
          })),
          skipDuplicates: true
        });
      }

      if (dto.allergenIds?.length) {
        await tx.productAllergen.createMany({
          data: dto.allergenIds.map((allergenId) => ({
            productId: product.id,
            allergenId,
          })),
          skipDuplicates: true,
        });
      }

      if (dto.modifierGroupIds?.length) {
        await tx.productModifierGroup.createMany({
          data: dto.modifierGroupIds.map((groupId) => ({
            productId: product.id,
            groupId,
          })),
          skipDuplicates: true,
        });
      }

      if (dto.variants?.length) {
        // Ensure only one default if multiple sent
        const defaults = dto.variants.filter((v) => v.isDefault);
        if (defaults.length > 1)
          throw new BadRequestException('Only one default variant allowed');

        await tx.productVariant.createMany({
          data: dto.variants.map((v) => ({
            productId: product.id,
            name: v.name,
            price: toDecimal(v.price),
            isDefault: v.isDefault ?? false,
            isAvailable: v.isAvailable ?? true,
            externalId: v.externalId,
            imageUrl: v.imageUrl,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          variants: true,
          ingredients: true,
          allergens: { include: { allergen: true } },
          modifierGroups: {
            include: { group: { include: { options: true } } },
          },
        },
      });
    });
  }

  async findAll(q: FindProductsDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (q.restaurantId) where.restaurantId = q.restaurantId;
    if (q.categoryId) where.categoryId = q.categoryId;
    if (q.q) where.name = { contains: q.q, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          variants: true,
          ingredients: true,
          allergens: { include: { allergen: true } },
          modifierGroups: { include: { group: { include: { options: true } } } },
        }
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: items,
      metadata: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string) {
    const p = await this.prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        ingredients: true,
        allergens: { include: { allergen: true } },
        modifierGroups: { include: { group: { include: { options: true } } } },
      },
    });
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    return this.prisma.product.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        imageUrl: dto.imageUrl,
        isAvailable: dto.isAvailable,
        displayOrder: dto.displayOrder,
        externalId: dto.externalId,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    // soft delete recommended; if you have deletedAt column, set it instead.
    return this.prisma.product.delete({ where: { id } });
  }

  async addVariant(productId: string, dto: AddVariantDto) {
    // Ensure product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');
    const isVarientExist = await this.prisma.productVariant.findFirst({
      where: { productId, name: dto.name },
    });
    if (isVarientExist)
      throw new BadRequestException('Variant already exists with same name');
    // If setting default, unset others
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.productVariant.updateMany({
          where: { productId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const created = await tx.productVariant.create({
        data: {
          productId,
          name: dto.name,
          price: toDecimal(dto.price),
          isDefault: dto.isDefault ?? false,
          isAvailable: dto.isAvailable ?? true,
          externalId: dto.externalId,
          imageUrl: dto.imageUrl,
        },
      });

      return tx.productVariant.findMany({
        where: { productId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      });
    });
  }

  async removeVariant(productId: string, variantId: string, hard = false) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.productId !== productId)
      throw new BadRequestException('Variant does not belong to this product');

    const [cartCount, orderCount] = await this.prisma.$transaction([
      this.prisma.cartItem.count({ where: { variantId } }),
      this.prisma.orderItem.count({ where: { variantId } }),
    ]);

    // Hard delete allowed only if completely unused
    if (hard) {
      if (cartCount > 0 || orderCount > 0) {
        throw new BadRequestException(
          'Cannot hard delete: variant is used in cart/order. Use soft remove instead.',
        );
      }
      return this.prisma.productVariant.delete({ where: { id: variantId } });
    }

    // Soft remove
    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: { isAvailable: false, isDefault: false },
    });

    // If product now has no default variant, set the oldest available as default (optional but nice)
    const hasDefault = await this.prisma.productVariant.count({
      where: { productId, isDefault: true, isAvailable: true },
    });

    if (hasDefault === 0) {
      const next = await this.prisma.productVariant.findFirst({
        where: { productId, isAvailable: true },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.prisma.productVariant.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return this.prisma.productVariant.findMany({
      where: { productId, isAvailable: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async listVariants(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productVariant.findMany({
      where: { productId, isAvailable: true },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async getVariant(productId: string, variantId: string) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    if (variant.productId !== productId)
      throw new BadRequestException('Variant does not belong to this product');
    return variant;
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
  ) {
    await this.getVariant(productId, variantId);

    return this.prisma.$transaction(async (tx) => {
      // If setting default => unset others
      if (dto.isDefault === true) {
        await tx.productVariant.updateMany({
          where: { productId, isDefault: true },
          data: { isDefault: false },
        });
      }

      const updated = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          name: dto.name,
          price: dto.price !== undefined ? toDecimal(dto.price) : undefined,
          isDefault: dto.isDefault,
          isAvailable: dto.isAvailable,
          externalId: dto.externalId,
          imageUrl: dto.imageUrl,
        },
      });

      // If we turned off availability and it was default, ensure another default exists (optional but nice)
      if (dto.isAvailable === false || dto.isDefault === false) {
        const hasDefault = await tx.productVariant.count({
          where: { productId, isDefault: true, isAvailable: true },
        });

        if (hasDefault === 0) {
          const next = await tx.productVariant.findFirst({
            where: { productId, isAvailable: true },
            orderBy: { createdAt: 'asc' },
          });
          if (next) {
            await tx.productVariant.update({
              where: { id: next.id },
              data: { isDefault: true },
            });
          }
        }
      }

      return updated;
    });
  }

  
}
