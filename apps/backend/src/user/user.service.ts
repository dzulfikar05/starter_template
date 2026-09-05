import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { prisma } from '@starter-template/database';
import { UpdateUserDto } from '@starter-template/types';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    async findById(userId: string) {
        const user = await prisma.userEntity.findUnique({ where: { id: userId } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async update(userId: string, data: UpdateUserDto) {
        try {
            const user = await prisma.userEntity.update({
                where: { id: userId },
                data,
            });
            this.logger.log(`User updated: ${user.id}`);
            return user;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error updating user: ${message}`);
            throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async delete(userId: string) {
        try {
            await prisma.userEntity.delete({ where: { id: userId } });
            this.logger.log(`User deleted: ${userId}`);
            return { success: true, message: 'User deleted successfully' };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Error deleting user: ${message}`);
            throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}