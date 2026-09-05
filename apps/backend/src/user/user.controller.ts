import { Controller, Get, Delete, Patch, Body, Logger, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt.guard';
import { Auth } from '../common/decorators/auth.decorators';
import type { RequestAuth } from '../common/decorators/auth.decorators';
import type { UpdateUserDto, UserResponseDto, DeleteUserResponseDto } from '@starter-template/types';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    private readonly logger = new Logger(UserController.name);

    constructor(private readonly userService: UserService) {}

    @Get('me')
    async getCurrentUser(@Auth() auth: RequestAuth): Promise<UserResponseDto> {
        this.logger.log(`Getting user: ${auth.userId}`);
        return this.userService.findById(auth.userId);
    }

    @Patch('me')
    async updateCurrentUser(
        @Auth() auth: RequestAuth,
        @Body() updateDto: UpdateUserDto,
    ): Promise<UserResponseDto> {
        this.logger.log(`Updating user: ${auth.userId}`);
        return this.userService.update(auth.userId, updateDto);
    }

    @Delete('me')
    async deleteCurrentUser(@Auth() auth: RequestAuth): Promise<DeleteUserResponseDto> {
        this.logger.log(`Deleting user: ${auth.userId}`);
        return this.userService.delete(auth.userId);
    }
}