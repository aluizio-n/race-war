# Race War — Backend

REST API built with Node.js, Fastify, Prisma, and PostgreSQL.

## Stack

- [Fastify](https://fastify.dev) — HTTP framework
- [Prisma](https://www.prisma.io) — ORM / migrations
- [PostgreSQL](https://www.postgresql.org) — database
- [Docker](https://www.docker.com) — local database

## Getting Started

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL
docker-compose up -d   # start PostgreSQL
npm install
npm run db:migrate
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed the database |
