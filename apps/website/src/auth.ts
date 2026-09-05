import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import axios from 'axios';

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/sign-in',
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const { email, password } = credentials as { email: string; password: string };

                try {
                    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
                    const { data } = await axios.post(`${backendUrl}/auth/login`, {
                        email,
                        password,
                    });

                    return {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.firstName ?? undefined,
                        accessToken: data.accessToken,
                        roles: data.user.roles ?? [],
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as { id: string }).id;
                token.accessToken = (user as { accessToken: string }).accessToken;
                token.roles = (user as { roles: string[] }).roles;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.roles = (token.roles as string[]) ?? [];
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
});