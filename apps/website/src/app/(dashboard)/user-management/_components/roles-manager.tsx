'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Role = {
    id: string;
    name: string;
    description?: string | null;
    _count?: { userRoles: number };
};

export function RolesManager() {
    const { data: session } = useSession();
    const [roles, setRoles] = useState<Role[]>([]);
    const [form, setForm] = useState({ name: '', description: '' });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

    const loadRoles = async () => {
        if (!session?.accessToken) return;
        setLoading(true);
        try {
            const response = await fetch(`${backendUrl}/roles`, {
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });
            if (!response.ok) {
                throw new Error('Unable to load roles');
            }
            const data = (await response.json()) as Role[];
            setRoles(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadRoles();
    }, [session?.accessToken]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!session?.accessToken) return;
        if (!form.name.trim()) return;

        setSaving(true);
        try {
            const body = JSON.stringify({
                name: form.name.trim(),
                description: form.description.trim() || undefined,
            });

            const url = editingId ? `${backendUrl}/roles/${editingId}` : `${backendUrl}/roles`;
            const method = editingId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${session.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body,
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(message || 'Failed to save role');
            }

            setForm({ name: '', description: '' });
            setEditingId(null);
            await loadRoles();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to save role');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (role: Role) => {
        setEditingId(role.id);
        setForm({ name: role.name, description: role.description ?? '' });
    };

    const handleDelete = async (roleId: string) => {
        if (!session?.accessToken || !confirm('Delete this role?')) return;

        try {
            const response = await fetch(`${backendUrl}/roles/${roleId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session.accessToken}` },
            });

            if (!response.ok) {
                throw new Error('Unable to delete role');
            }

            await loadRoles();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to delete role');
        }
    };

    return (
        <main className="flex flex-1 flex-col gap-6 p-8">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Roles</h1>
                    <p className="text-sm text-muted-foreground">Create, update, and remove access roles.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="grid gap-4 md:grid-cols-[1.2fr_2fr_auto]">
                    <input
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="Role name"
                        className="rounded-md border border-input bg-background px-3 py-2"
                    />
                    <input
                        value={form.description}
                        onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                        placeholder="Description"
                        className="rounded-md border border-input bg-background px-3 py-2"
                    />
                    <button
                        type="submit"
                        disabled={saving || !form.name.trim()}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                    >
                        {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                    </button>
                </div>
                {editingId && (
                    <button
                        type="button"
                        onClick={() => {
                            setEditingId(null);
                            setForm({ name: '', description: '' });
                        }}
                        className="mt-3 text-sm text-muted-foreground underline"
                    >
                        Cancel edit
                    </button>
                )}
            </form>

            <div className="grid gap-4 md:grid-cols-3">
                {loading ? (
                    <div className="col-span-full rounded-lg border border-dashed p-6 text-muted-foreground">Loading roles...</div>
                ) : roles.length === 0 ? (
                    <div className="col-span-full rounded-lg border border-dashed p-6 text-muted-foreground">No roles available.</div>
                ) : (
                    roles.map((role) => (
                        <div key={role.id} className="rounded-lg border border-border bg-card p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold">{role.name}</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">{role.description || 'No description'}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => handleEdit(role)} className="text-sm text-primary underline">Edit</button>
                                    <button type="button" onClick={() => handleDelete(role.id)} className="text-sm text-destructive underline">Delete</button>
                                </div>
                            </div>
                            <p className="mt-4 text-xs text-muted-foreground">{role._count?.userRoles ?? 0} assigned users</p>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
