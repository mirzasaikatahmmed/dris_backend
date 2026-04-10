import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // ← your prisma service
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addToFavorites(
    userId: string,
    dto: CreateFavoriteDto,
  ) {
    try {
      const favorite = await this.prisma.favorite.create({
        data: {
          userId,
          productId: dto.productId,
        },
        include: { product: true },
      });

      return favorite;
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('This product is already in favorites');
      }
      throw e;
    }
  }

  async getUserFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
    include: {product: true},
      orderBy: { createdAt: 'desc' },
    });
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<void> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { id: favoriteId },
    });

    if (!favorite || favorite.userId !== userId) {
      throw new NotFoundException('Favorite not found or not owned by user');
    }

    await this.prisma.favorite.delete({
      where: { id: favoriteId },
    });
  }

  // Optional: remove by productId instead of favoriteId
  async removeByProductId(userId: string, productId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: {
        userId,
        productId,
      },
    });
  }
}
