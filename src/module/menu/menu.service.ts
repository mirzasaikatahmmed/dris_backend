import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { FindMenuQueryDto } from './dto/find-query.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMenuDto) {
    const { categoryIds, ...menuData } = dto;
    if (categoryIds && categoryIds?.length > 0) {
      const existingCategories = await this.prisma.category.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        select: {
          id: true,
        },
      });
      console.log({existingCategories})
         if (existingCategories.length !== categoryIds!.length) {
           throw new BadRequestException('Some categories do not exist');
         }
  }
    
 
  const isMenuExist = await this.prisma.menu.findFirst({
    where: { name: menuData?.name, restaurantId: menuData?.restaurantId },
  });
    console.log({isMenuExist})
    if(isMenuExist){
      throw new BadRequestException('Menu name already exist')
    }
    if(menuData.validFrom && menuData.validUntil){
      this.validateMenuDates(menuData.validFrom, menuData.validUntil)

    }

    const result = await  this.prisma.menu.create({
      data: {
        ...menuData,
        // displayOrder: menuData.displayOrder ?? 0,
        isActive: menuData.isActive ?? true,
        validFrom: new Date(menuData.validFrom!),
        validUntil: new Date(menuData.validUntil!),
        categories: categoryIds ? { connect: categoryIds.map(id => ({ id })) } : undefined
      },
      include: { categories: true },
    });
    console.log({result})
    return result
  }

  async findAll(dto: FindMenuQueryDto) {
    const {restaurantId, page = 1, limit = 10} = dto
    const skip = (page - 1) * limit
    const where: any = {isActive: true}
    if(restaurantId){
      where.restaurantId = restaurantId
    }
    const res= await  this.prisma.menu.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      skip,
      take: limit,
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            description: true
         }
        },
      },
    });
    const total = await this.prisma.menu.count({where})
    return {
      data: res,
      metadata: {
        page,
        limit,
        total
      }
    }
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        categories: {
          orderBy: { displayOrder: 'asc' },
          select: {
            id: true,
            name: true,
            imageUrl: true,
            description: true,
          },
        },
      },
    });

    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async update(id: string, dto: UpdateMenuDto) {
    await this.findOne(id);
    if (dto.validFrom && dto.validUntil) {
      this.validateMenuDates(dto.validFrom, dto.validUntil )
    }
    return this.prisma.menu.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.menu.update({ where: { id } ,data: {isActive: false}});
    // or soft-delete if you add isActive to Menu
  }


 validateMenuDates(
  validFrom: string,
  validUntil: string
): { valid: boolean; message?: string } {

  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

  if (!isoRegex.test(validFrom)) {
    return { valid: false, message: 'validFrom must be in ISO format' };
  }

  if (!isoRegex.test(validUntil)) {
    return { valid: false, message: 'validUntil must be in ISO format' };
  }

  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);
  const now = new Date();

  // 2️⃣ Check if valid date object
  if (isNaN(fromDate.getTime())) {
    return { valid: false, message: 'validFrom is not a valid date' };
  }

  if (isNaN(untilDate.getTime())) {
    return { valid: false, message: 'validUntil is not a valid date' };
  }

  // 3️⃣ validFrom cannot be in the past
  if (fromDate < now) {
    return { valid: false, message: 'validFrom cannot be less than current time' };
  }

  // 4️⃣ validUntil must be greater than validFrom
  if (untilDate <= fromDate) {
    return { valid: false, message: 'validUntil must be greater than validFrom' };
  }

  return { valid: true };
}


}