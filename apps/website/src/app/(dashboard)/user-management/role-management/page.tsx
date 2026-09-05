import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { RoleAssignmentManager } from '../_components/role-assignment-manager';

export default async function RoleManagementPage() {
    const session = await auth();
    if (!session?.user.roles?.includes('ADMIN')) redirect('/dashboard');

    return <RoleAssignmentManager />;
}
