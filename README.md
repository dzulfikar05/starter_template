# Starter Template

A full-stack TypeScript monorepo powered by Next.js, NestJS, AuthJS, Prisma, and Turborepo.

## Project structure

```
starter-template/
├── apps/
│   ├── backend/                 # NestJS API (port 3001)
│   └── website/                 # Next.js frontend (port 3000)
├── packages/
│   ├── database/                # Prisma schema, migrations, client
│   └── types/                   # Shared DTOs and response types
├── docker-compose.yml           # Local PostgreSQL
└── turbo.json
```

Environment files are already created in each app package. Set `AUTH_SECRET` and the backend/database variables before running the app.

## Database

```bash
docker compose up -d
bun run db:migrate:deploy
bun run db:seed
```

The seed is idempotent and creates the `ADMIN` and `USER` roles, the default
CRUD permissions, their role-permission assignments, and the default
administrator account:

```
Email: admin@mail.com
Password: password
```

Default local connection:

```
postgresql://postgres:postgres@localhost:5432/starter_template?schema=public
```

## Development

```bash
bun run dev
```

| Service | URL |
|---------|-----|
| Website | http://localhost:3000 |
| Backend | http://localhost:3001 |
| Prisma Studio | `bun run db:studio` |

## Packages

| Package | Description |
|---------|-------------|
| `@starter-template/backend` | NestJS API |
| `@starter-template/website` | Next.js app |
| `@starter-template/database` | Prisma client and migrations |
| `@starter-template/types` | Shared DTOs |

## License

MIT
