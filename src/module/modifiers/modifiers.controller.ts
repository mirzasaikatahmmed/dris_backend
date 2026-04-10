import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateModifierGroupDto } from './dto/create-modifier-group.dto';
import { CreateModifierOptionDto } from './dto/create-modifier-option.dto';
import { AttachGroupToProductDto } from './dto/attach-group-to-product.dto';
import { ModifiersService } from './modifiers.service';

@ApiTags('Modifiers')
@Controller('modifiers')
export class ModifiersController {
  constructor(private readonly service: ModifiersService) {}

  @Post('groups')
  createGroup(@Body() dto: CreateModifierGroupDto) {
    return this.service.createGroup(dto);
  }

  @Post('options')
  addOption(@Body() dto: CreateModifierOptionDto) {
    return this.service.addOption(dto);
  }

  @Post('attach')
  attachToProduct(@Body() dto: AttachGroupToProductDto) {
    return this.service.attachToProduct(dto);
  }

  @Get('groups/:id')
  getGroup(@Param('id') id: string) {
    return this.service.getGroup(id);
  }

  @Get('restaurants/:restaurantId/groups')
  list(@Param('restaurantId') restaurantId: string) {
    return this.service.listRestaurantGroups(restaurantId);
  }
}
