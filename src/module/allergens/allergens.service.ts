import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAllergenDto } from './dto/create-allergen.dto';
import { UpdateAllergenDto } from './dto/update-allergen.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FindAllergenDto } from './dto/find-allergen.dto';

@Injectable()
export class AllergensService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAllergenDto) {
    const isAlergenExist = await this.prisma.allergen.findFirst({
      where: {
        OR: [
          {
            name: dto.name,
          },
          {
            code: dto.code,
          },
        ],
      },
    });
    if (isAlergenExist) {
      const message =
        isAlergenExist.name === dto.name
          ? 'Allergen name already exists'
          : 'Allergen code already exists';
      throw new BadRequestException(message);
    }
    return await this.prisma.allergen.create({ data: dto });
  }

  async findAll(dto: FindAllergenDto) {
    const { search, page = 1, limit = 10 } = dto;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }
    const result = await this.prisma.allergen.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
    });
    return {
      data: result,
      metadata: {
        total: await this.prisma.allergen.count({ where }),
        page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    const isAlergenExist = await this.prisma.allergen.findUnique({
      where: { id },
    });
    if (!isAlergenExist) throw new NotFoundException('Allergen not found');
    return isAlergenExist;
  }

  async update(id: string, dto: UpdateAllergenDto) {
    await this.findOne(id);
    return this.prisma.allergen.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);

    const product = await this.prisma.product.findMany({
      where: { allergens: { some: { allergenId: id } } },
    });
    console.log({ product });
    if (product && product.length > 0) {
      throw new BadRequestException(
        `Allergen is in use by ${product.length} product(s)`,
      );
    }
    const result = await this.prisma.allergen.delete({ where: { id } });
    return result;
  }

  async addAllergenToProduct(productId: string, allergenId: string) {
    const [product, allergen] = await Promise.all([
      this.prisma.product.findUnique({ where: { id: productId } }),
      this.prisma.allergen.findUnique({ where: { id: allergenId } }),
    ]);

    if (!product) throw new NotFoundException('Product not found');
    if (!allergen) throw new NotFoundException('Allergen not found');

    try {
      // composite PK prevents duplicates
      return await this.prisma.productAllergen.create({
        data: { productId, allergenId },
      });
    } catch (e: any) {
      // if already exists
      throw new BadRequestException('Allergen already attached to product');
    }
  }

  async removeAllergenFromProduct(productId: string, allergenId: string) {
    // If not existing, Prisma throws; we can pre-check to return nicer error
    const existing = await this.prisma.productAllergen.findUnique({
      where: { productId_allergenId: { productId, allergenId } },
    });

    if (!existing)
      throw new NotFoundException('Allergen not attached to this product');

    return this.prisma.productAllergen.delete({
      where: { productId_allergenId: { productId, allergenId } },
    });
  }

  async listProductAllergens(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.productAllergen.findMany({
      where: { productId },
      include: { allergen: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
