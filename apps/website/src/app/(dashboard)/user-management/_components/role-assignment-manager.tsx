'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';

type Role = {
    id: string;
    name: string;
    description?: string | null;
};

type UserRole = {
    role: {
        id: string;
        name: string;
    };
};

type UserRecord = {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    userRoles: UserRole[];
};

export function RoleAssignmentManager() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [saving, setSaving] = useState<Record<string, boolean>>({});
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    useEffect(() => {
        if (!session?.accessToken) return;

        const loadData = async () => {
            try {
                const [userResponse, roleResponse] = await Promise.all([
                    fetch(`${backendUrl}/user`, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
                    fetch(`${backendUrl}/roles`, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
                ]);

                if (!userResponse.ok || !roleResponse.ok) {
                    throw new Error('Unable to fetch user permissions');
                }

                setUsers((await userResponse.json()) as UserRecord[]);
                setRoles((await roleResponse.json()) as Role[]);
            } catch (error) {
                console.error(error);
            }
        };

        void loadData();
    }, [session?.accessToken, backendUrl]);

    const usersWithRoleSummary = useMemo(
        () =>
            users.map((user) => ({
                ...user,
                assignedRoleNames: user.userRoles.map(({ role }) => role.name),
            })),
        [users],
    );

    const updateRoles = async (userId: string, nextRoleIds: string[]) => {
        if (!session?.accessToken) return;
        setSaving((current) => ({ ...current, [userId]: true }));
        try {
            const response = await fetch(`${backendUrl}/user/${userId}/roles`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roleIds: nextRoleIds }),
            });

            if (!response.ok) {
                throw new Error('Unable to update roles');
            }

            const updatedUser = (await response.json()) as UserRecord;
            setUsers((currentUsers) =>
                currentUsers.map((user) => (user.id === userId ? updatedUser : user)),
            );
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to update roles');
        } finally {
            setSaving((current) => ({ ...current, [userId]: false }));
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-6 p-8">
            <div>
                <h1 className="text-2xl font-bold">Users Management</h1>
                <p className="text-sm text-muted-foreground">Set roles for each user and review access assignments.</p>
            </div>

            <div className="grid gap-4">
                {usersWithRoleSummary.map((user) => {
                    const selectedRoleIds = user.userRoles.map(({ role }) => role.id);

                    return (
                        <div key={user.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold">
                                        {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {user.assignedRoleNames.length > 0 ? user.assignedRoleNames.join(', ') : 'No roles'}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {roles.map((role) => {
                                    const checked = selectedRoleIds.includes(role.id);
                                    return (
                                        <button
                                            type="button"
                                            key={role.id}
                                            onClick={() => {
                                                const next = checked
                                                    ? selectedRoleIds.filter((id) => id !== role.id)
                                                    : [...selectedRoleIds, role.id];
                                                void updateRoles(user.id, next);
                                            }}
                                            disabled={saving[user.id]}
                                            className={`rounded-full border px-3 py-1.5 text-sm ${
                                                checked
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'border-input bg-background text-foreground'
                                            }`}
                                        >
                                            {role.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
