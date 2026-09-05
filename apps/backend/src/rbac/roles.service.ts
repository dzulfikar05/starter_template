import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const name = this.normalizeName(data.name);
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    return prisma.role.create({
      data: { name, description: this.normalizeDescription(data.description) },
    });
  }

  async update(
    id: string,
    data: { name?: string; description?: string },
  ): Promise<unknown> {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    const name = data.name === undefined ? undefined : this.normalizeName(data.name);
    if (name && name !== existing.name) {
      const duplicate = await prisma.role.findUnique({ where: { name } });
      if (duplicate) {
        throw new ConflictException('Role name already exists');
      }
    }

    return prisma.role.update({
      where: { id },
      data: {
        name,
        description:
          data.description === undefined
            ? undefined
            : this.normalizeDescription(data.description),
      },
    });
  }

  async remove(id: string): Promise<unknown> {
    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Role not found');
    }

    return prisma.role.delete({ where: { id } });
  }

  private normalizeName(name: string): string {
    const normalized = name.trim().toUpperCase();
    if (normalized.length < 2) {
      throw new BadRequestException('Role name must contain at least 2 characters');
    }
    return normalized;
  }

  private normalizeDescription(description?: string): string | undefined {
    const normalized = description?.trim();
    return normalized || undefined;
  }
}
