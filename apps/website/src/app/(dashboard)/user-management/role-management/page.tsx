import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function RoleManagementPage() {
    const session = await auth();
    if (!session?.user.roles?.includes('ADMIN')) redirect('/dashboard');
    return <main className="flex flex-1 flex-col gap-6 p-8"><h1 className="text-2xl font-bold">Role Management</h1><p className="text-muted-foreground">Create roles and assign permissions through the administrative API.</p><div className="rounded-lg border border-border bg-card p-6 text-sm">Use <code className="rounded bg-muted px-1">POST /roles</code> to create a role. Role changes are restricted to administrators.</div></main>;
}
