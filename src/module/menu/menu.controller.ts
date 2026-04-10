import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';
import { MenusService } from './menu.service';
import { successPaginatedResponse, successResponse } from 'src/utils/response.utils';
import { FindMenuQueryDto } from './dto/find-query.dto';
import { ValidateAdmin } from 'src/common/decorators/jwt.decorator';

@ApiTags('Menus')
@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @ValidateAdmin()
  @ApiOperation({ summary: 'Create new menu (can attach categories)' })
  async create(@Body() createMenuDto: CreateMenuDto) {
    const result = await this.menusService.create(createMenuDto);
    return successResponse(result, 'Menu created successfully')
  }

  @Get()
  @ApiOperation({ summary: 'Get all menus of a restaurant' })
  async findAll(@Query() dto: FindMenuQueryDto) {
    const res = await  this.menusService.findAll(dto);
    return successPaginatedResponse(res?.data, res.metadata, 'Menus retrived successfully')
  }

  @Get(':menuId')
  @ApiOperation({ summary: 'Get single menu with categories' })
  async findOne(@Param('menuId') menuId: string) {
    const result = await this.menusService.findOne(menuId);
    return successResponse(result, 'Menu retrived successfully')
  }

  @Patch(':menuId')
  @ValidateAdmin()
  @ApiOperation({ summary: 'Update menu basic info' })
  async update(@Param('menuId') menuId: string, @Body() updateMenuDto: UpdateMenuDto) {
    const result = await this.menusService.update(menuId, updateMenuDto);
    return successResponse(result, 'Menu update successfully')
  }

  @Delete(':menuId')
  @ValidateAdmin()
  @ApiOperation({ summary: 'Delete menu (soft delete)' })
  async remove(@Param('menuId') menuId: string) {
    const result = await this.menusService.remove(menuId);
    return successResponse(result, 'Menu deleted successfully')
  }
}