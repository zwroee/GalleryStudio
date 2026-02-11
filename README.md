# Gallery Studio - Self-Hosted Photo Gallery Platform

A production-ready, self-hosted photo gallery platform for photographers to deliver client galleries with password protection, favorites, and download capabilities.

## Features

### 🔐 Admin Features
- JWT-based authentication
- Create and manage galleries
- Upload multiple photos (supports RAW/HEIC conversion)
- Password-protect galleries
- Control download and favorite permissions
- Delete galleries and photos

### 📸 Client Features
- Password-protected gallery access
- Responsive photo grid
- Fullscreen image viewer with keyboard navigation
- Favorite photos (session-based, no account needed)
- Download photos (if enabled)

### ⚡ Performance
- Automatic image processing (4 sizes: thumbnail, preview, web, original)
- Nginx serves images directly (not through Node.js)
- Async upload processing
- Image caching with long expiry

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Fastify (web framework)
- PostgreSQL (database)
- Sharp (image processing)
- JWT authentication
- bcrypt (password hashing)

**Frontend:**
- React + TypeScript
- TailwindCSS
- Vite
- Zustand (state management)
- React Router
- Axios

**Deployment:**
- Docker + Docker Compose
- Nginx (reverse proxy + static file serving)

## Quick Start (Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run migrate:up
npm run create-admin
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to the backend at `http://localhost:3000`.

## Production Deployment (Docker)

### 1. Clone and Configure

```bash
git clone <your-repo>
cd gallery-studio
cp .env.example .env
# Edit .env with secure passwords
```

### 2. Build and Start

```bash
docker-compose up -d
```

### 3. Run Migrations

```bash
docker-compose exec backend npm run migrate:up
```

### 4. Create Admin User

```bash
docker-compose exec backend npm run create-admin
```

### 5. Access

- Frontend: `http://your-server`
- Admin: `http://your-server/admin`

## CasaOS Installation

1. Open the **App Store** in your CasaOS dashboard.
2. Click on **Custom Install** (top right).
3. Select **Import** and paste the content of `casaos-config.json` OR import the `docker-compose.yml` file directly.
4. Ensure the ports (8080) are not in use.
5. Click **Install**.

## GitHub Pages Demo

A static demo of the frontend is available. To deploy:

1. Enable GitHub Pages in your repository settings (Source: GitHub Actions).
2. Push to the `main` branch.
3. The "Deploy Demo" workflow will automatically build and deploy the demo to your Pages URL.
4. Access the demo at `https://<username>.github.io/gallery-studio/`.

## Project Structure

```
gallery-studio/
├── backend/              # Node.js backend
│   ├── src/
│   │   ├── config/      # Database & env config
│   │   ├── middleware/  # Auth & validation
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   └── types/       # TypeScript types
│   ├── migrations/      # Database migrations
│   └── scripts/         # Utility scripts
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   └── store/       # State management
│   └── public/
├── storage/             # Image storage (volume mount)
│   └── galleries/
│       └── {gallery_id}/
│           ├── original/
│           ├── preview/
│           ├── thumbnail/
│           └── web/
├── docker-compose.yml
├── nginx.conf
└── README.md
```

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
- `GET /api/client/galleries/:id` - View gallery
- `POST /api/client/photos/:id/favorite` - Toggle favorite
- `GET /api/client/galleries/:id/favorites` - Get favorited photos

## Image Processing

Uploaded images are automatically processed into:
- **Thumbnail** (400px) - Grid view
- **Preview** (1920px) - Fullscreen viewing
- **Web** (2048px) - Downloads
- **Original** - Preserved

RAW and HEIC formats are automatically converted to JPEG.

## Environment Variables

### Backend (.env)
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/gallery_studio
JWT_SECRET=your-secret-key
STORAGE_PATH=/storage/galleries
MAX_UPLOAD_SIZE=524288000  # 500MB
```

### Docker (.env in root)
```env
DB_PASSWORD=your-db-password
JWT_SECRET=your-jwt-secret
```

## Security Considerations

- Change default passwords in `.env`
- Use strong JWT secret (generate with `openssl rand -base64 32`)
- Set up SSL/TLS certificates for production
- Configure firewall rules
- Regular backups of PostgreSQL database and storage directory

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
