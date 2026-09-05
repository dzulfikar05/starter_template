'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export function AuthHeader() {
    const { data: session, status } = useSession();

    return (
        <header className="flex justify-end items-center p-4 gap-2 h-16 border-b border-border bg-background">
            <ThemeToggle />
            {status !== 'loading' && !session && (
                <>
                    <Button variant="outline" asChild>
                        <Link href="/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/sign-up">Sign up</Link>
                    </Button>
                </>
            )}
            {session && (
                <>
                    <Button variant="outline" asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
                        Sign out
                    </Button>
                </>
            )}
        </header>
    );
}