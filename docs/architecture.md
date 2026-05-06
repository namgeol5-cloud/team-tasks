# Architecture — Team Tasks

```
                        Vercel (호스팅)
                             │
              ┌──────────────────────────────┐
              │  Next.js  Front + API Routes │
              └──────────┬───────────────────┘
                         │                  │
        ┌────────────────────────┐   ┌──────────────┐
        │ Supabase  Postgres+Auth│   │ Google OAuth │
        └────────────────────────┘   └──────────────┘
```
