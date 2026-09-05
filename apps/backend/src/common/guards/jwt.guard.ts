import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractToken(request);
        if (!token) throw new UnauthorizedException();

        try {
            const payload = jwt.verify(token, process.env.AUTH_SECRET!) as {
                sub: string;
                email: string;
            };
            request.user = { id: payload.sub, email: payload.email };
            return true;
        } catch {
            throw new UnauthorizedException();
        }
    }

    private extractToken(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}