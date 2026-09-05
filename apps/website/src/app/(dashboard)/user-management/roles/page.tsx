import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RolesManager } from '../_components/roles-manager';

export default async function RolesPage() {
    const session = await auth();
    if (!session?.user.roles?.includes('ADMIN')) redirect('/dashboard');

    return <RolesManager />;
}
