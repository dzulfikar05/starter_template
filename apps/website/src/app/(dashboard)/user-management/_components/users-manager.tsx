'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

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

type Role = {
    id: string;
    name: string;
    description?: string | null;
};

export function UsersManager() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [pending, setPending] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    const loadData = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const [userResponse, roleResponse] = await Promise.all([
                fetch(`${backendUrl}/user`, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
                fetch(`${backendUrl}/roles`, { headers: { Authorization: `Bearer ${session.accessToken}` } }),
            ]);

            if (!userResponse.ok || !roleResponse.ok) {
                throw new Error('Unable to load user and role data');
            }

            const userData = (await userResponse.json()) as UserRecord[];
            const roleData = (await roleResponse.json()) as Role[];
            setUsers(userData);
            setRoles(roleData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, [session?.accessToken]);

    const toggleRole = async (userId: string, roleId: string) => {
        if (!session?.accessToken) return;

        const current = users.find((user) => user.id === userId)?.userRoles.map(({ role }) => role.id) ?? [];
        const next = current.includes(roleId)
            ? current.filter((id) => id !== roleId)
            : [...current, roleId];

        setPending((currentMap) => ({ ...currentMap, [userId]: true }));
        try {
            const response = await fetch(`${backendUrl}/user/${userId}/roles`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roleIds: next }),
            });

            if (!response.ok) {
                throw new Error('Unable to update user roles');
            }

            setUsers((currentUsers) =>
                currentUsers.map((user) =>
                    user.id === userId
                        ? {
                              ...user,
                              userRoles: next
                                  .map((id) => {
                                      const matchedRole = roles.find((role) => role.id === id);
                                      return matchedRole ? { role: { id: matchedRole.id, name: matchedRole.name } } : null;
                                  })
                                  .filter((entry): entry is { role: { id: string; name: string } } => Boolean(entry)),
                          }
                        : user,
                ),
            );
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to update user roles');
        } finally {
            setPending((currentMap) => ({ ...currentMap, [userId]: false }));
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-6 p-8">
            <div>
                <h1 className="text-2xl font-bold">Users</h1>
                <p className="text-sm text-muted-foreground">Manage user access and assign roles.</p>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
                <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr] gap-4 border-b border-border p-4 text-sm font-medium text-muted-foreground">
                    <span>Name</span>
                    <span>Email</span>
                    <span>Roles</span>
                </div>

                {loading ? (
                    <div className="p-6 text-muted-foreground">Loading users...</div>
                ) : users.length === 0 ? (
                    <div className="p-6 text-muted-foreground">No users available.</div>
                ) : (
                    users.map((user) => {
                        const assigned = user.userRoles.map(({ role }) => role.id);
                        return (
                            <div key={user.id} className="border-b border-border p-4 last:border-b-0">
                                <div className="grid gap-4 md:grid-cols-[1.5fr_1.5fr_2fr] md:items-center">
                                    <div>
                                        {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                                    </div>
                                    <div>{user.email}</div>
                                    <div className="flex flex-wrap gap-2">
                                        {roles.map((role) => {
                                            const checked = assigned.includes(role.id);
                                            return (
                                                <label key={role.id} className="flex cursor-pointer items-center gap-2 rounded-full border border-input px-2 py-1 text-xs">
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={pending[user.id]}
                                                        onChange={() => void toggleRole(user.id, role.id)}
                                                    />
                                                    {role.name}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </main>
    );
}
