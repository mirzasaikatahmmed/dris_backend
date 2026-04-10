import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { FindCategoryQueryDto } from './dto/find-category.dto';
import { successPaginatedResponse, successResponse } from 'src/utils/response.utils';
import { ValidateAdmin } from 'src/common/decorators/jwt.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @HttpCode(HttpStatus.CREATED)
  @ValidateAdmin()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const resul= await  this.categoriesService.create(createCategoryDto);
    return successResponse(resul, 'Category created successfully')
  }

  @Get()
  @ApiOperation({ summary: 'Get all active categories for a restaurant' })
  async findAll(@Query() dto: FindCategoryQueryDto) {
    const result = await  this.categoriesService.findAll(dto);
    return successPaginatedResponse(result.data, result.metadata, 'Categories retrived successfully')
  }

  @Get(':categoryId')
  @ApiOperation({ summary: 'Get single category' })
  @ApiParam({ name: 'categoryId', example: 'uuid' })
  async findOne(@Param('categoryId') categoryId: string) {
    const result = await this.categoriesService.findOne(categoryId);
    return successResponse(result, 'Category retrived successfully')
  }

  @Patch(':categoryId')
  @ApiOperation({ summary: 'Update category' })
  @ValidateAdmin()
  async update(@Param('categoryId') categoryId: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    const result = await this.categoriesService.update(categoryId, updateCategoryDto);
    return successResponse(result, 'Category updated successfully')
  }

  @Delete(':categoryId')
  @ApiOperation({ summary: 'Deactivate category (soft delete)' })
  remove(@Param('categoryId') categoryId: string) {
    return this.categoriesService.remove(categoryId);
  }
}