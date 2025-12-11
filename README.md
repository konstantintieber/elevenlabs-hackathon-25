# Big Berlin Hack

Have a look at [this PDF](./showcase.pdf) for a visual guide of how this project helps business owners and individuals to speed up the creation of any kind of contract.

AI tools used:
- OpenAI
- n8n
- Cartesia
- Libra assistants API (to connect to law databases with otherwise private documents)

Contracts are generated with markdown formatting by libra assistants.
We use the convertapi service to convert it to a pdf file and provide a downloadable link to clients.

This repository is organized as a monorepo with two packages:
- backend: Express.js API written in TypeScript
- frontend: The frontend for our lawyers

## Prerequisites
- Node.js 18 or newer
- pnpm

## Install
From the repository root:

1. Install all workspace dependencies:
   pnpm install

## Backend
- Development:
   pnpm run dev:backend
- Build:
   pnpm run build:backend
- Start (after build):
   pnpm run start:backend

Configuration:
- PORT environment variable can be used to change the listening port (default 3000).

## Frontend

The frontend to manage contracts.

pnpm run dev:frontend

## n8n

This directory contains an export of the workflows that power the communication with the various AI tools.

### Database
The backend uses SQLite with Prisma ORM. The database file is located at:
- **`backend/prisma/dev.db`**

To set up the database:
1. Run migrations: `npm run --prefix backend migrate`
2. (Optional) Open Prisma Studio to view/edit data: `npm run --prefix backend prisma:studio`

The database is automatically created when you run migrations.
