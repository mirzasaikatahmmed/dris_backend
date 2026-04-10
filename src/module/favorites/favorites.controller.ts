import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { GetUser, ValidateUser } from 'src/common/decorators/jwt.decorator';

@ApiTags('favorites')

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
    @ValidateUser()
  @ApiOperation({ summary: 'Add product to favorites' })

  @ApiResponse({ status: 409, description: 'Already favorited' })
  async addToFavorites(
    @GetUser('id') userId: string,
    @Body() dto: CreateFavoriteDto,
  ) {
    return this.favoritesService.addToFavorites(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user favorites' })

  async getFavorites(
    @GetUser('id') userId: string,
  ){
    return this.favoritesService.getUserFavorites(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove favorite by favorite ID' })
  async removeFavorite(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<void> {
    await this.favoritesService.removeFavorite(userId, id);
  }

  // Alternative endpoint — often more convenient for frontend
  @Delete('product/:productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove favorite by product ID' })
  async removeByProductId(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.favoritesService.removeByProductId(userId, productId);
  }
}
