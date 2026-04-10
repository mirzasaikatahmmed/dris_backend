import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { FindCategoryQueryDto } from './dto/find-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    const isCategoryExist = await this.prisma.category.findFirst({where: {name:dto.name}})
    if(isCategoryExist){
      throw new BadRequestException('Category name already exist')
    }
    if (dto.parentId) {
      const isParentExist = await this.prisma.category.findFirst({ where: { id: dto.parentId } })
      if (!isParentExist) {
        throw new NotFoundException('Parent Category not found')
      }
    }
    return this.prisma.category.create({
      data: {
        ...dto,
     
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(dto:FindCategoryQueryDto) {
    const {restaurantId,name, page = 1, limit = 10} = dto
    const skip = (page - 1) * limit
    const where: any = {isActive: true}
    if (restaurantId) {
      const isRestaurentExist = await this.prisma.restaurant.findFirst({ where: { id: dto.restaurantId } })
      if (!isRestaurentExist) {
        throw new NotFoundException('Restaurent not found')
      }
      where.restaurantId = restaurantId
    }
     if (name) {
       where.name = { contains: name, mode: 'insensitive' };
     }

    const result = await this.prisma.category.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        subcategories: {
          select: {
            name: true,
            id: true,
            imageUrl: true,
            isActive: true,
          },
        },
        parent: {
          select: {
            name: true,
            id: true,
            imageUrl: true,
            isActive: true,
          },
        },
        products: {
          select: {
            id: true,
            imageUrl: true,
            name: true,
            description: true
          }
        }
      },
    });
    const total = await this.prisma.category.count({where})
    return {
      data: result,
      metadata: {
        page,
        limit,
        total
      }
    }
    
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          select: {
            name: true,
            id: true,
            imageUrl: true,
            isActive: true,
          },
        },
        parent: {
          select: {
            name: true,
            id: true,
            imageUrl: true,
            isActive: true,
          },
        },
        products: {
          select: {
            id: true,
            imageUrl: true,
            name: true,
            description: true,
          },
        },
        menus: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
    });

    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findOne(id); // check exists

    if (dto?.parentId) {
      await this.findOne(dto.parentId)
    }
    return this.prisma.category.update({
      where: { id },
      data: dto,
      include: {
        parent: true,
        subcategories: true
      }
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
   
  }
}