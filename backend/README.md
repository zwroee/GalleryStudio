# Pixiset Remake - Backend

Self-hosted photo gallery platform backend built with Node.js, TypeScript, Fastify, and PostgreSQL.

## Features

- 🔐 JWT-based admin authentication
- 📸 Photo gallery management with password protection
- 🖼️ Automatic image processing (thumbnails, previews, web-size)
- ⭐ Client favorites system
- 📦 Multi-file upload support
- 🚀 Async image processing
- 🗄️ PostgreSQL database with migrations

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Storage directory for images

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Create storage directory**
   ```bash
   mkdir -p /storage/galleries
   # Or use the path specified in STORAGE_PATH
   ```

4. **Run database migrations**
   ```bash
   npm run migrate:up
   ```

5. **Create admin user**
   ```bash
   npm run create-admin
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication (Admin)
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Galleries (Admin)
- `GET /api/galleries` - List all galleries
- `POST /api/galleries` - Create gallery
- `GET /api/galleries/:id` - Get gallery details
- `PATCH /api/galleries/:id` - Update gallery
- `DELETE /api/galleries/:id` - Delete gallery
- `POST /api/galleries/:id/photos` - Upload photos
- `DELETE /api/galleries/:galleryId/photos/:photoId` - Delete photo

### Client Access
- `POST /api/client/galleries/:id/verify` - Verify gallery password
- `GET /api/client/galleries/:id` - View gallery (with session token)
- `POST /api/client/photos/:id/favorite` - Toggle favorite
- `GET /api/client/galleries/:id/favorites` - Get favorited photos

## Database Schema

- **admin_users** - Admin accounts
- **galleries** - Photo galleries with password protection
- **photos** - Photo metadata and processing status
- **favorites** - Client favorites (session-based)

## Image Processing

Uploaded images are automatically processed into:
- **Thumbnail** - 400px (grid view)
- **Preview** - 1920px (fullscreen viewing)
- **Web** - 2048px (downloads)
- **Original** - Preserved original file

Images are stored at: `/storage/galleries/{gallery_id}/{size}/{filename}`

## Production Build

```bash
npm run build
npm start
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate:up` - Run database migrations
- `npm run migrate:down` - Rollback last migration
- `npm run create-admin` - Create admin user (interactive)
