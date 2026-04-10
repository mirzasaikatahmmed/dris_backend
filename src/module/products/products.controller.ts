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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FindProductsDto } from './dto/find-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ValidateAdmin } from 'src/common/decorators/jwt.decorator';
import { successResponse } from 'src/utils/response.utils';
import { AddVariantDto } from './dto/add-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  @ValidateAdmin()
  async create(@Body() dto: CreateProductDto) {
    const result = await this.service.create(dto);
    return successResponse(result, 'Product created successfully');
  }

  @Get()
  async findAll(@Query() q: FindProductsDto) {
    const result = await this.service.findAll(q);
    return successResponse(result, 'Products retrieved successfully');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne(id);
    return successResponse(result, 'Product retrieved successfully');
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const result = await this.service.update(id, dto);
    return successResponse(result, 'Product updated successfully');
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.service.remove(id);
    return successResponse(result, 'Product removed successfully');
  }

  // ✅ Add variant to a product
  @Post(':productId/add-variant')
  @ValidateAdmin()
  async addVariant(
    @Param('productId') productId: string,
    @Body() dto: AddVariantDto,
  ) {
    const result = await this.service.addVariant(productId, dto);
    return successResponse(result, 'Variant added successfully');
  }

  // ✅ Remove variant (soft by default)
  // /products/:productId/variants/:variantId?hard=true
  @Delete(':productId/remove-variant/:variantId')
  @ValidateAdmin()
  async removeVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Query('hard') hard?: string,
  ) {
    const result = await this.service.removeVariant(
      productId,
      variantId,
      hard === 'true',
    );
    return successResponse(result, 'Variant removed successfully');
  }

  @Get(':productId/variants')
  async listVariants(@Param('productId') productId: string) {
    const result = await this.service.listVariants(productId);
    return successResponse(result, 'Variants retrieved successfully');
  }

  // ✅ Single variant
  @Get(':productId/variants/:variantId')
  async getVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
  ) {
    const result = await this.service.getVariant(productId, variantId);
    return successResponse(result, 'Variant retrieved successfully');
  }

  // ✅ Update variant
  @Patch(':productId/variants/:variantId')
  async updateVariant(
    @Param('productId') productId: string,
    @Param('variantId') variantId: string,
    @Body() dto: UpdateVariantDto,
  ) {
    const result = await this.service.updateVariant(productId, variantId, dto);
    return successResponse(result, 'Variant updated successfully');
  }
}
