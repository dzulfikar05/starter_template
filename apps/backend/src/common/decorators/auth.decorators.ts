import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export interface RequestAuth {
    userId: string;
    email: string;
}

export const Auth = createParamDecorator((_data: unknown, ctx: ExecutionContext): RequestAuth => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) throw new UnauthorizedException();

    return {
        userId: request.user.id,
        email: request.user.email,
    };
});