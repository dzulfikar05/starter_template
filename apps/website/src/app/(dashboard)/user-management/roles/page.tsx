import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import axios from 'axios';

export default async function RolesPage() {
    const session = await auth();
    if (!session?.user.roles?.includes('ADMIN')) redirect('/dashboard');
    let roles: { id: string; name: string; description: string | null; _count: { userRoles: number } }[] = [];
    try {
        roles = (
            await axios.get(`${process.env.BACKEND_URL || 'http://localhost:3001'}/roles`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            })
        ).data;
    } catch (error) {
        const message = axios.isAxiosError(error)
            ? error.response?.data?.message || error.message
            : 'Unable to load roles.';
        throw new Error(message);
    }
    return <main className="flex flex-1 flex-col gap-6 p-8"><h1 className="text-2xl font-bold">Roles</h1><div className="grid gap-4 md:grid-cols-3">{roles.map((role) => <div className="rounded-lg border border-border p-5" key={role.id}><h2 className="font-semibold">{role.name}</h2><p className="mt-1 text-sm text-muted-foreground">{role.description || 'No description'}</p><p className="mt-4 text-xs text-muted-foreground">{role._count.userRoles} assigned users</p></div>)}</div></main>;
}
