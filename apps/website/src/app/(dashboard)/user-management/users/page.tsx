import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import axios from 'axios';

export default async function UsersPage() {
    const session = await auth();
    if (!session?.user.roles?.includes('ADMIN')) redirect('/dashboard');
    let users: { id: string; email: string; firstName: string | null; lastName: string | null; userRoles: { role: { name: string } }[] }[] = [];
    try {
        const { data } = await axios.get(`${process.env.BACKEND_URL || 'http://localhost:3001'}/user`, {
            headers: { Authorization: `Bearer ${session.accessToken}` },
        });
        users = data;
    } catch (error) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Unable to load users.';
        throw new Error(message);
    }
    return <main className="flex flex-1 flex-col gap-6 p-8"><h1 className="text-2xl font-bold">Users</h1><div className="rounded-lg border border-border"><div className="grid grid-cols-3 gap-4 border-b p-4 text-sm font-medium"><span>Name</span><span>Email</span><span>Roles</span></div>{users.map((user) => <div className="grid grid-cols-3 gap-4 border-b p-4 text-sm" key={user.id}><span>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</span><span>{user.email}</span><span>{user.userRoles.map(({ role }) => role.name).join(', ') || 'USER'}</span></div>)}</div></main>;
}
