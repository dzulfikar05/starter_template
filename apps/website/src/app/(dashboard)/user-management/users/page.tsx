import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { UsersManager } from '../_components/users-manager';

export default async function UsersPage() {
    const session = await auth();
    if (!session?.user.roles?.includes('ADMIN')) redirect('/dashboard');

    return <UsersManager />;
}
