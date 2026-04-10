import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AllergensService } from './allergens.service';
import { CreateAllergenDto } from './dto/create-allergen.dto';
import { UpdateAllergenDto } from './dto/update-allergen.dto';
import { ValidateAdmin } from 'src/common/decorators/jwt.decorator';
import {
  successPaginatedResponse,
  successResponse,
} from 'src/utils/response.utils';
import { FindAllergenDto } from './dto/find-allergen.dto';
import { ProductAllergenDto } from './dto/product-allergen.dto';

@ApiTags('Allergens')
@Controller('allergens')
export class AllergensController {
  constructor(private readonly service: AllergensService) {}

  @Post()
  @ValidateAdmin()
  async create(@Body() dto: CreateAllergenDto) {
    const result = await this.service.create(dto);
    return successResponse(result, 'Allergen created successfully');
  }

  @Get()
  async findAll(@Query() dto: FindAllergenDto) {
    const result = await this.service.findAll(dto);
    return successPaginatedResponse(
      result.data,
      result.metadata,
      'Allergens retrieved successfully',
    );
  }

  @Get(':allergenId')
  async findOne(@Param('allergenId') allergenId: string) {
    const result = await this.service.findOne(allergenId);
    return successResponse(result, 'Allergen retrieved successfully');
  }

  @Patch(':allergenId')
  @ValidateAdmin()
  async update(
    @Param('allergenId') allergenId: string,
    @Body() dto: UpdateAllergenDto,
  ) {
    const result = await this.service.update(allergenId, dto);
    return successResponse(result, 'Allergen updated successfully');
  }

  @Delete(':allergenId')
  @ValidateAdmin()
  async remove(@Param('allergenId') allergenId: string) {
    const result = await this.service.remove(allergenId);
    return successResponse(result, 'Allergen removed successfully');
  }

  @Post('add-to-product/:productId/:allergenId')
  @ValidateAdmin()
  async attachToProduct(
    @Param('productId') productId: string,
    @Param('allergenId') allergenId: string,
  ) {
    const result = await this.service.addAllergenToProduct(productId, allergenId);
    return successResponse(result, 'Allergen attached to product successfully');
  }

  @Delete('remove-from-product/:productId/:allergenId')
  @ValidateAdmin()
  async detachFromProduct(
    @Param('productId') productId: string,
    @Param('allergenId') allergenId: string,
  ) {
    const result = await this.service.removeAllergenFromProduct(productId, allergenId);
    return successResponse(result, 'Allergen detached from product successfully');
  }

  @Get('product/:productId')
  async listProductAllergens(@Param('productId') productId: string) {
    const result = await this.service.listProductAllergens(productId);
    return successResponse(result, 'Product allergens retrieved successfully');
  }
}
