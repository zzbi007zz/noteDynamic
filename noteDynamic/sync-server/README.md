# Sync Server for QuickNote

A high-performance sync server for the QuickNote app with delta sync, conflict resolution, and rate limiting.

## Features

- ✅ **Delta Sync** - Only sync changes, not full data
- ✅ **Conflict Resolution** - Vector clock-based automatic conflict detection
- ✅ **Rate Limiting** - Per-user rate limits with Redis
- ✅ **JWT Authentication** - Secure token-based auth with refresh tokens
- ✅ **Compression** - Gzip/Brotli compression support
- ✅ **Prisma ORM** - Type-safe database operations

## Architecture

```
Client (React Native) <-> HTTP/REST <-> Sync Server (Node.js/Express) <-> PostgreSQL
                              ↓
                         Redis (Rate Limiting + Cache)
```

## Project Structure

```
sync-server/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── config/
│   │   ├── database.ts     # Prisma client
│   │   └── redis.ts        # Redis connection
│   ├── middleware/
│   │   ├── auth.ts         # JWT authentication
│   │   ├── error-handler.ts
│   │   ├── rate-limit.ts   # Redis-based rate limiting
│   │   └── validation.ts   # Zod validation
│   ├── routes/
│   │   ├── auth.ts         # Authentication routes
│   │   ├── health.ts
│   │   └── sync.ts         # Sync routes
│   ├── services/
│   │   ├── sync.ts         # Sync business logic
│   │   └── conflict.ts     # Conflict resolution
│   ├── types/
│   │   ├── sync.ts         # Sync types
│   │   └── express.d.ts    # Express type extensions
│   ├── utils/
│   │   ├── jwt.ts          # JWT utilities
│   │   ├── vector-clock.ts # Vector clock for conflict detection
│   │   ├── checksum.ts     # Data integrity checksums
│   │   └── retry.ts        # Retry logic with backoff
│   ├── validation/
│   │   └── sync.ts         # Zod validation schemas
│   └── index.ts            # Entry point
├── .env.example
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login existing user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Sync
- `POST /api/v1/sync/pull` - Pull changes from server
- `POST /api/v1/sync/push` - Push changes to server
- `GET /api/v1/sync/status` - Get sync status
- `POST /api/v1/sync/resolve` - Resolve conflicts

### Health
- `GET /api/v1/health` - Health check
- `GET /api/v1/health/ready` - Readiness check
- `GET /api/v1/health/live` - Liveness check

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3001` |
| `DATABASE_URL` | PostgreSQL connection | - |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - |
| `JWT_ACCESS_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |

## Testing

Run tests:
```bash
npm test
```

Run with coverage:
```bash
npm run test:coverage
```

## License

MIT
