import { PartialType } from '@nestjs/swagger';
import { CreateRestaurentDto } from './create-restaurent.dto';
// import { CreateRestaurentDto } from './create-restaurent.dto';

export class UpdateRestaurentDto extends PartialType(CreateRestaurentDto) {}
