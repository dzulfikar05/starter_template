'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { registerUser } from '@/_actions/auth.actions';
import { Button } from '@/components/ui/button';

export default function SignUpPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const result = await registerUser({ email, password, firstName, lastName });

        if (!result.success) {
            setLoading(false);
            setError(result.error || 'Registration failed. Please try again.');
            return;
        }

        const signInResult = await signIn('credentials', { email, password, redirect: false });
        setLoading(false);

        if (signInResult?.error) {
            router.push('/sign-in');
            return;
        }

        router.push('/dashboard');
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-border p-6">
                <h1 className="text-xl font-semibold">Create your account</h1>
                <p className="text-sm text-muted-foreground">Get started with your workspace in minutes.</p>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium">First name</label>
                        <input
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium">Last name</label>
                        <input
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email address</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign up'}
                </Button>
            </form>
        </div>
    );
}