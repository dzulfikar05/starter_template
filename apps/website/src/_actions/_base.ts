'use server';

import { auth } from '@/auth';
import jwt from 'jsonwebtoken';
import axios, { type AxiosInstance } from 'axios';

export async function getAuthenticatedApi(): Promise<AxiosInstance> {
    const session = await auth();

    if (!session?.user?.id || !session.user.email) {
        throw new Error('Unauthorized: No authentication session available');
    }

    const token = jwt.sign(
        { sub: session.user.id, email: session.user.email },
        process.env.AUTH_SECRET!,
        { expiresIn: '5m' },
    );

    const authenticatedApi = axios.create({
        baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return authenticatedApi;
}

export async function createServerAction<T>(
    handler: (api: AxiosInstance) => Promise<T>,
): Promise<T> {
    try {
        const api = await getAuthenticatedApi();
        return await handler(api);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const data = error.response?.data as Record<string, unknown> | undefined;
            const msg = data?.message;
            const message = Array.isArray(msg)
                ? msg[0]
                : typeof msg === 'string'
                  ? msg
                  : data?.error ?? data?.detail ?? error.message;
            const status = error.response?.status;
            const hint = status === 502 || status === 503 ? ' (backend may be unavailable)' : '';
            throw new Error(`${message}${hint}`);
        }
        throw error;
    }
}