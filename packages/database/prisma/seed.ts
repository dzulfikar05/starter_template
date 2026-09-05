import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL must be configured before running the database seed.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const roles = [
  {
    name: "ADMIN",
    description: "Full administrative access",
  },
  {
    name: "USER",
    description: "Standard application user",
  },
] as const;

const permissions = [
  { name: "user.read", description: "View users" },
  { name: "user.create", description: "Create users" },
  { name: "user.update", description: "Update users" },
  { name: "user.delete", description: "Delete users" },
  { name: "role.read", description: "View roles" },
  { name: "role.create", description: "Create roles" },
  { name: "role.update", description: "Update roles" },
  { name: "role.delete", description: "Delete roles" },
  { name: "permission.read", description: "View permissions" },
  { name: "permission.assign", description: "Assign permissions to roles" },
] as const;

async function main() {
  const seededRoles = new Map<string, { id: string }>();
  for (const role of roles) {
    const seededRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
      select: { id: true },
    });
    seededRoles.set(role.name, seededRole);
  }

  const seededPermissions = new Map<string, { id: string }>();
  for (const permission of permissions) {
    const seededPermission = await prisma.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission,
      select: { id: true },
    });
    seededPermissions.set(permission.name, seededPermission);
  }

  const adminRole = seededRoles.get("ADMIN");
  if (!adminRole) {
    throw new Error("ADMIN role was not seeded");
  }

  for (const permission of permissions) {
    const seededPermission = seededPermissions.get(permission.name);
    if (!seededPermission) {
      throw new Error(`Permission was not seeded: ${permission.name}`);
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: seededPermission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: seededPermission.id,
      },
    });
  }

  const userRole = seededRoles.get("USER");
  if (!userRole) {
    throw new Error("USER role was not seeded");
  }

  for (const permissionName of ["user.read"] as const) {
    const permission = seededPermissions.get(permissionName);
    if (!permission) {
      throw new Error(`Permission was not seeded: ${permissionName}`);
    }

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  const passwordHash = await bcrypt.hash("password", 12);
  const admin = await prisma.userEntity.upsert({
    where: { email: "admin@mail.com" },
    update: {
      passwordHash,
      firstName: "System",
      lastName: "Administrator",
    },
    create: {
      email: "admin@mail.com",
      passwordHash,
      firstName: "System",
      lastName: "Administrator",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: adminRole.id,
    },
  });

  console.log(
    `Seed completed: ${roles.length} roles, ${permissions.length} permissions, admin@mail.com`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
