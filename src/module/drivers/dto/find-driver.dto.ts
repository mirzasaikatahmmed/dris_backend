import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsInt, IsNumber, IsOptional, IsUUID, Min } from "class-validator";

export class FindQuery {
    @ApiProperty()
    @Transform(({ value }) => Number(value))
    @IsInt()
    businessLocationId: number;

    @ApiPropertyOptional({
        description: "Page number for pagination",
        default: 1,
        example: 1,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        description: "Number of items per page",
        default: 10,
        example: 10,
    })
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number = 10;
}
