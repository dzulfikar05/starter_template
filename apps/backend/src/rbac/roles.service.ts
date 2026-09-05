import { Injectable } from '@nestjs/common';
import { prisma } from '@starter-template/database';

@Injectable()
export class RolesService {
  async list(): Promise<unknown> {
    return prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { userRoles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; description?: string }): Promise<unknown> {
    return prisma.role.create({
      data: { name: data.name.toUpperCase(), description: data.description },
    });
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<unknown> {
    return prisma.role.update({
      where: { id },
      data: { ...data, name: data.name?.toUpperCase() },
    });
  }

  async remove(id: string): Promise<unknown> {
    return prisma.role.delete({ where: { id } });
  }
}
