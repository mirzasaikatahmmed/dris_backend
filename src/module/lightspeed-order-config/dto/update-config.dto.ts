import { OmitType, PartialType } from "@nestjs/swagger";
import { CreateOrderConfigDto } from "./create-config.dto";

export class UpdateOrderConfigDto extends PartialType(
    OmitType(CreateOrderConfigDto, ["businessLocationId"])
) {}
