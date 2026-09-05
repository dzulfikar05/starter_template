import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class UpdateRoleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

export class RoleResponseDto {
    id!: string;
    name!: string;
    description?: string | null;
}
