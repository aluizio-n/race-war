# Race War

A location-based competitive fitness game that gamifies physical activities (running, biking, skateboarding) by turning them into territorial conquest battles.

## How It Works

1. Choose an activity mode: **run**, **bike**, or **skate**
2. Move outdoors while the app tracks your GPS route in real time
3. If you close the route back to your starting point, you **conquer that area as a territory**
4. Territories score points based on their enclosed area (m²)
5. Compete on global leaderboards, complete time-limited challenges, and battle friends for supremacy

---

## Project Structure

```
race-war/
├── frontend/      # Expo / React Native mobile app (iOS & Android)
├── backend/       # Node.js / Express REST API
└── README.md
```

---

## Frontend

**Stack:** Expo SDK 54 · React Native 0.81 · TypeScript  
**Routing:** Expo Router v6 (file-based)  
**Styling:** NativeWind v4 (Tailwind CSS for React Native)  
**Maps:** React Native Maps (Google Maps)  
**Animations:** React Native Reanimated v4  
**Charts:** Victory Native  
**Icons:** Lucide React Native  

### Screens

| Route | Description |
|---|---|
| `index.tsx` | Animated splash screen |
| `onboarding.tsx` | First-run onboarding flow |
| `(auth)/login` | User login |
| `(auth)/register` | Account creation |
| `(auth)/forgot-password` | Password recovery |
| `(tabs)/home` | Dashboard / activity feed |
| `(tabs)/map` | Interactive territory map (polygons on Google Maps) |
| `(tabs)/leaderboard` | Global rankings by activity mode |
| `(tabs)/start` | Activity setup (mode selector, pre-flight checklist) |
| `(tabs)/profile` | User profile, stats, badges, friends |
| `activity/tracking` | Live GPS tracking during an activity |
| `activity/result` | Post-activity summary (distance, time, calories, territory) |
| `challenges` | Active challenges and rewards |

### Running the frontend

```bash
cd frontend
npm install
npm start          # Start Expo dev server
npm run android    # Run on Android emulator
npm run ios        # Run on iOS simulator
npm run web        # Run in browser
```

---

## Backend

**Stack:** Node.js · Express 4 · TypeScript  
**Database:** PostgreSQL 16 · Prisma ORM  
**Auth:** JWT (15-minute access tokens) + refresh token rotation  
**Validation:** Zod  
**Security:** Helmet · CORS · bcryptjs (12 rounds) · express-rate-limit  
**Logging:** Morgan  

### Database Schema

| Model | Description |
|---|---|
| `User` | Account with email, nickname, name, avatar |
| `RefreshToken` | JWT refresh token tracking (revocation support) |
| `Activity` | GPS activity (race/bike/skate) with route, distance, duration, calories |
| `Territory` | Conquered polygon area (coordinates + area in m²) |
| `Friendship` | Friend connections with request/accept flow |
| `Challenge` | Time-limited objectives with targets and rewards |
| `UserChallenge` | Per-user progress on challenges |

### API Endpoints

#### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | Create account |
| POST | `/login` | — | Login, receive tokens |
| POST | `/refresh` | — | Rotate refresh token |
| POST | `/logout` | — | Revoke refresh token |

#### Users (`/api/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/me` | ✓ | Current user profile |
| PATCH | `/me` | ✓ | Update profile |
| GET | `/:id` | — | Get user by ID |
| GET | `/search` | ✓ | Search users by query |
| GET | `/friends` | ✓ | List friends |
| GET | `/friends/pending` | ✓ | Pending friend requests |
| POST | `/friends/:id` | ✓ | Send friend request |
| PATCH | `/friends/requests/:id/accept` | ✓ | Accept friend request |

#### Activities (`/api/activities`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | ✓ | Start a new activity |
| PATCH | `/:id/finish` | ✓ | Finish activity & save route |
| GET | `/` | ✓ | List user's activities |
| GET | `/:id` | ✓ | Get activity details |
| DELETE | `/:id` | ✓ | Delete an activity |

#### Territories (`/api/territories`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | List all territories |
| GET | `/my/stats` | ✓ | Current user's territory stats |
| GET | `/user/:id/stats` | — | Territory stats for any user |
| GET | `/:id` | — | Get territory details |

#### Leaderboard (`/api/leaderboard`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Global rankings |
| GET | `/me` | ✓ | Current user's rank |

#### Challenges (`/api/challenges`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | ✓ | List active challenges |

#### Health

| Method | Path | Description |
|---|---|---|
| GET | `/health` | API health check |

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```env
NODE_ENV=development
PORT=3333

POSTGRES_USER=racewar
POSTGRES_PASSWORD=change-this-password
POSTGRES_DB=racewar
DATABASE_URL=postgresql://racewar:change-this-password@localhost:5432/racewar?schema=public

JWT_SECRET=change-this-to-a-long-random-string
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
```

### Running the backend locally

```bash
cd backend
npm install
cp .env.example .env  # fill in your values

npm run db:migrate    # apply migrations
npm run db:seed       # optional: seed sample data
npm run dev           # start with hot reload (port 3333)
```

Other useful scripts:

```bash
npm run build         # compile TypeScript
npm run db:studio     # open Prisma Studio UI
npm run db:push       # push schema changes without migration
```

---

## Docker (Production)

The backend ships with a multi-stage Dockerfile and a `docker-compose.yml` that spins up PostgreSQL 16 and the API together.

```bash
cd backend
cp .env.example .env  # fill in production values
docker compose up -d
```

Services:

| Service | Port | Description |
|---|---|---|
| `db` | 5432 | PostgreSQL 16 with persistent volume |
| `api` | 3333 | Node.js API (runs migrations on startup) |

Both services include health checks. The API waits for the database to be ready before accepting connections.

---

## Rate Limits

| Scope | Limit |
|---|---|
| Auth endpoints | 20 requests / 15 minutes |
| General API | 200 requests / minute |

---

## Tech Summary

| Layer | Technology |
|---|---|
| Mobile app | React Native + Expo |
| Routing | Expo Router (file-based) |
| Styling | NativeWind (Tailwind) |
| API | Node.js + Express |
| Database | PostgreSQL + Prisma |
| Auth | JWT + refresh tokens |
| Deployment | Docker + Docker Compose |
