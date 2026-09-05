import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { prisma } from '@starter-template/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
} from '@starter-template/types';

@Injectable()
export class AuthService {
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await prisma.userEntity.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new HttpException('Email already registered', HttpStatus.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await prisma.userEntity.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        userRoles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: 'USER' },
                create: {
                  name: 'USER',
                  description: 'Standard application user',
                },
              },
            },
          },
        },
      },
      include: { userRoles: { include: { role: true } } },
    });

    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await prisma.userEntity.findUnique({
      where: { email: dto.email },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return this.buildResponse(user);
  }

  private buildResponse(user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    passwordHash: string;
    userRoles?: { role: { name: string } }[];
  }): AuthResponseDto {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        roles: user.userRoles?.map(({ role }) => role.name) ?? [],
      },
      process.env.AUTH_SECRET!,
      { expiresIn: '30d' },
    );

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.userRoles?.map(({ role }) => role.name) ?? [],
      },
    };
  }
}
