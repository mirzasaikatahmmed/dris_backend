import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { toDecimal } from '../../common/helpers/money';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { AttachGroupToProductDto } from './dto/attach-group-to-product.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModifiersService {
  constructor(private prisma: PrismaService) {}

  async createGroup(dto: CreateModifierGroupDto) {
    return this.prisma.modifierGroup.create({ data: dto });
  }

  async addOption(dto: CreateModifierOptionDto) {
    // Ensure group exists
    const group = await this.prisma.modifierGroup.findUnique({
      where: { id: dto.groupId },
      include: { options: true }
    });
    if (!group) throw new NotFoundException('Modifier group not found');

    return this.prisma.modifierOption.create({
      data: {
        groupId: dto.groupId,
        name: dto.name,
        price: toDecimal(dto.price),
        isActive: dto.isActive ?? true,
        displayOrder: group?.options.length ?? 0,
        externalId: dto.externalId,
      },
    });
  }

  async attachToProduct(dto: AttachGroupToProductDto) {
    // avoid duplicates
    try {
      return await this.prisma.productModifierGroup.create({
        data: { productId: dto.productId, groupId: dto.groupId },
      });
    } catch (e: any) {
      throw new BadRequestException('Already attached or invalid ids');
    }
  }

  async getGroup(id: string) {
    const g = await this.prisma.modifierGroup.findUnique({
      where: { id },
      include: { options: { orderBy: { displayOrder: 'asc' } } },
    });
    if (!g) throw new NotFoundException('Modifier group not found');
    return g;
  }

  async listRestaurantGroups(restaurantId: string) {
    return this.prisma.modifierGroup.findMany({
      where: { restaurantId },
      include: { options: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });
  }
}
