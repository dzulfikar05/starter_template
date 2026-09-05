import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/sign-in', '/sign-up'];

export default auth((req) => {
    const isPublic = PUBLIC_PATHS.some(
        (path) => req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(`${path}/`),
    );

    if (!req.auth && !isPublic) {
        const signInUrl = new URL('/sign-in', req.nextUrl.origin);
        signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        '/((?!_next|api/auth|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};