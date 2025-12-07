# GroupTherapy Records - Record Label Website

## Overview

GroupTherapy Records is a comprehensive electronic music record label website featuring both a public-facing platform for music discovery and fan engagement, and an admin dashboard for content management. The application showcases releases, artists, events, radio streams, videos, and news while providing authenticated administrators with full CRUD capabilities for managing all content.

The platform is built as a full-stack TypeScript application with React frontend and Express backend, designed for deployment on Vercel with PostgreSQL database support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Core Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**Routing**: Wouter provides lightweight client-side routing with separate hierarchies for public pages (home, releases, artists, events, etc.) and admin dashboard routes (releases management, events management, settings, etc.).

**UI Framework**: Shadcn/UI component library built on Radix UI primitives, configured with a "new-york" style. The design system supports dark mode via Tailwind CSS with custom design tokens for colors, spacing, and typography.

**State Management Strategy**:
- TanStack Query (React Query) handles all server state and API data fetching with aggressive caching to minimize network requests
- React Context manages global radio player state and theme preferences
- Local component state uses React hooks for UI-specific concerns

**Styling System**: Tailwind CSS with extensive customization through CSS variables for theme switching. Custom font stack includes Space Grotesk for headlines, Geist for body text, and Geist Mono for monospace content.

**Animation**: Framer Motion powers page transitions, carousels, parallax effects, and interactive elements throughout the application.

**Form Handling**: React Hook Form with Zod schema validation via @hookform/resolvers ensures type-safe form management.

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript, designed to run both as a local development server and as Vercel serverless functions.

**API Design**: RESTful API with all routes prefixed under `/api`. Key endpoints include:
- `/api/auth/*` - Authentication (login, logout, session verification)
- `/api/releases/*` - Release CRUD operations
- `/api/events/*` - Event management
- `/api/artists/*` - Artist roster management
- `/api/posts/*` - News/blog content
- `/api/videos/*` - Video content management
- `/api/playlists/*` - Curated playlists
- `/api/radio-shows/*` - Radio show scheduling
- `/api/contacts/*` - Contact form submissions

**Static File Serving**: In production, Express serves the compiled Vite build from `dist/public` with SPA fallback to `index.html` for client-side routing.

**Development Environment**: Vite dev server integrates as Express middleware for hot module replacement during development. Separate build processes use esbuild for server bundling and Vite for client compilation.

**Storage Abstraction**: `IStorage` interface defines all data operations, allowing implementations to swap between in-memory storage (for development) and database-backed storage (for production).

### Authentication System

**Token-Based Authentication**: JWT (JSON Web Tokens) for stateless authentication with configurable expiration (default 24 hours).

**Security Features**:
- bcrypt password hashing with configurable salt rounds
- Rate limiting on login attempts (5 max attempts, 15-minute lockout)
- Login attempt tracking by username and IP address
- Session token verification middleware for protected routes

**Admin User Management**: Separate `adminUsers` table tracks admin accounts with role-based access control (admin, editor, contributor roles supported).

### Data Storage

**Database**: PostgreSQL accessed via Drizzle ORM for type-safe database queries.

**Schema Design** (`shared/schema.ts` defines all tables):

**Core Content Tables**:
- `releases` - Music releases (albums, EPs, singles) with artist info, cover art, Spotify links, genres
- `artists` - Artist roster with bios, images, social links, Spotify artist IDs
- `events` - Shows and festivals with venue details, dates, ticket links, lineup info
- `posts` - News articles and blog content with categories, featured status, author attribution
- `videos` - Video content with YouTube/Vimeo integration, thumbnails, view counts
- `playlists` - Curated playlists with Spotify URLs, track counts, cover art
- `radioShows` - Radio show scheduling with hosts, time slots, live status

**Authentication Tables**:
- `adminUsers` - Admin user accounts with roles, password hashes, activity tracking
- `loginAttempts` - Security audit trail of login attempts (successful and failed)

**Supporting Tables**:
- `contacts` - Contact form submissions with categories and status tracking
- `teamMembers` - About page team information
- `pressAssets` - Press kit materials and downloads

**Database Connection Strategy**: Connection pooling configured for Supabase/Neon PostgreSQL providers with SSL support. Drizzle migrations stored in `/migrations` directory.

## External Dependencies

### Cloud Services & APIs

**Database**: PostgreSQL via Supabase (recommended) or Neon for serverless Postgres. Connection requires `DATABASE_URL` environment variable with transaction pooling mode.

**Media Storage**: Cloudinary for image, video, and audio uploads. Requires `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` environment variables. Falls back to local file handling if not configured.

**Deployment Platform**: Vercel for serverless hosting. Configuration in `vercel.json` defines:
- Serverless function routing via `/api/index.ts`
- Static asset serving from `dist/public`
- SPA fallback routing
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

### Third-Party Integrations

**Spotify Web API**: `@spotify/web-api-ts-sdk` for fetching artist data, track information, and playlist integration. Used for enriching release metadata with Spotify data.

**Music Streaming**: Radio player supports live streaming URLs (currently configured with Zeno.fm demo stream). Customizable via radio context provider.

**Social Media**: Integration points for Instagram, Twitter/X, Spotify, SoundCloud, and YouTube profiles across artists, releases, and brand pages.

### Development Tools

**Build System**: 
- Vite for frontend bundling with React plugin
- esbuild for server compilation with dependency allowlist to reduce cold starts
- TypeScript compilation with strict mode enabled

**Code Quality**:
- TypeScript with strict type checking
- Shared schema validation via Zod
- Drizzle Kit for database migrations

**UI Component Libraries**:
- Radix UI for accessible headless components
- React Icons (Simple Icons) for brand logos
- Lucide React for interface icons
- Framer Motion for animations

### Required Environment Variables

**Production (Required)**:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing (min 32 characters)
- `ADMIN_USERNAME` - Initial admin username for seeding
- `ADMIN_PASSWORD` - Initial admin password

**Optional**:
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name for media uploads
- `VITE_CLOUDINARY_UPLOAD_PRESET` - Cloudinary upload preset
- `CORS_ORIGIN` - CORS allowed origin (defaults to permissive in dev)
- `BCRYPT_SALT_ROUNDS` - Password hashing rounds (default: 10)
- `NODE_ENV` - Environment flag (auto-set by Vercel)