import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';

export interface RequestAuth {
  userId: string;
  email: string;
  roles: string[];
}

export const Auth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestAuth => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) throw new UnauthorizedException();

    return {
      userId: request.user.id,
      email: request.user.email,
      roles: request.user.roles ?? [],
    };
  },
);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
