import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { prisma } from '@starter-template/database';
import { UpdateUserDto, UpdateUserRolesDto } from '@starter-template/types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  async findById(userId: string) {
    const user = await prisma.userEntity.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async list() {
    return prisma.userEntity.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        userRoles: { select: { role: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRoles(userId: string, data: UpdateUserRolesDto) {
    const roleIds = data.roleIds ?? [];

    const user = await prisma.userEntity.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const validRoles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    });

    if (validRoles.length !== new Set(roleIds).size) {
      throw new HttpException('One or more role IDs are invalid', HttpStatus.BAD_REQUEST);
    }

    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({ where: { userId } });

      if (roleIds.length > 0) {
        await tx.userRole.createMany({
          data: roleIds.map((roleId) => ({ userId, roleId })),
        });
      }
    });

    return this.findById(userId);
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
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
