'use server';

import axios from 'axios';

export async function registerUser(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}) {
    try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        await axios.post(`${backendUrl}/auth/register`, data);
        return { success: true };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || 'Registrasi gagal';
            return { success: false, error: message as string };
        }
        return { success: false, error: 'Registrasi gagal' };
    }
}