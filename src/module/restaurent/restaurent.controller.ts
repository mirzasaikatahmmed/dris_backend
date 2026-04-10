import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { RestaurentService } from './restaurent.service';
import { UpdateRestaurentDto } from './dto/update-restaurent.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { successPaginatedResponse, successResponse } from 'src/utils/response.utils';
import { FindRestaurantDto } from './dto/find-restaurent.dto';
import { ValidateAdmin } from 'src/common/decorators/jwt.decorator';
import { CreateRestaurentDto } from './dto/create-restaurent.dto';

@Controller('restaurent')
export class RestaurentController {
  constructor(private readonly restaurantsService: RestaurentService) {}

  @Post()
  @ValidateAdmin()
  @ApiOperation({ summary: 'Create a new restaurant' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRestaurantDto: CreateRestaurentDto) {
    const result = await  this.restaurantsService.create(createRestaurantDto);
    return successResponse(result, 'Restaurent created successfully')
  }

  @Get()
  @ApiOperation({ summary: 'Get all active restaurants' })
  async findAll(@Query() dto: FindRestaurantDto) {
    const result = await  this.restaurantsService.findAll(dto);
    return successPaginatedResponse(result.data,result.metadata, 'Restaurents  retrived successfully')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a restaurant by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const result = await  this.restaurantsService.findOne(id);
    return successResponse(result, 'Restaurent retrived successfully')
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a restaurant' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRestaurantDto: UpdateRestaurentDto,
  ) {
    const result = await  this.restaurantsService.update(id, updateRestaurantDto);
    return successResponse(result, 'Restaurent updated successfully')
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a restaurant' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    const result = await  this.restaurantsService.remove(id);
    return successResponse(null, 'Restaurent deleted successfully')
  }
  @Delete(':id/hard')
  // @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Hard delete a restaurant' })
  async deleteHard(@Param('id', ParseUUIDPipe) id: string) {
    await  this.restaurantsService.hardDeleted(id);
    return successResponse(null, 'Restaurent deleted successfully')
  }
}
