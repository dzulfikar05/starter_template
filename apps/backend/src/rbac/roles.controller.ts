import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/auth.decorators';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto } from '@starter-template/types';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class RolesController {
  constructor(private readonly roles: RolesService) {}
  @Get() list(): Promise<unknown> {
    return this.roles.list();
  }
  @Post() create(@Body() body: CreateRoleDto): Promise<unknown> {
    return this.roles.create(body);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ): Promise<unknown> {
    return this.roles.update(id, body);
  }
  @Delete(':id') remove(@Param('id') id: string): Promise<unknown> {
    return this.roles.remove(id);
  }
}
