import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { config } from './config/env';
import './config/database'; // Initialize database connection

const fastify = Fastify({
    logger: {
        level: config.nodeEnv === 'production' ? 'info' : 'debug',
    },
    bodyLimit: config.maxUploadSize,
});

// Register plugins
async function registerPlugins() {
    // CORS - allow frontend to make requests
    await fastify.register(cors, {
        origin: config.nodeEnv === 'production' ? config.frontendUrl : true,
        credentials: true,
    });

    // JWT authentication
    await fastify.register(jwt, {
        secret: config.jwtSecret,
    });

    // Multipart form data (for file uploads)
    await fastify.register(multipart, {
        limits: {
            fileSize: config.maxUploadSize,
            files: 50, // Max 50 files per upload
        },
    });
}

// Register routes
async function registerRoutes() {
    // Health check endpoint
    fastify.get('/health', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: config.nodeEnv,
        };
    });

    // Import route modules
    const authRoutes = await import('./routes/auth.routes');
    const galleryRoutes = await import('./routes/gallery.routes');
    const clientRoutes = await import('./routes/client.routes');
    const portfolioRoutes = await import('./routes/portfolio.routes');

    // Register API routes
    await fastify.register(authRoutes.default, { prefix: '/api/auth' });
    await fastify.register(galleryRoutes.default, { prefix: '/api/galleries' });
    await fastify.register(clientRoutes.default, { prefix: '/api/client' });
    await fastify.register(portfolioRoutes.default, { prefix: '/api/portfolio' });

    // Debug routes (temporary)
    const debugRoutes = await import('./routes/debug.routes');
    await fastify.register(debugRoutes.default, { prefix: '/api/debug' });
}

// Start server
async function start() {
    try {
        await registerPlugins();
        await registerRoutes();

        await fastify.listen({
            port: config.port,
            host: '0.0.0.0' // Listen on all network interfaces
        });

        console.log(`🚀 Server running on http://localhost:${config.port}`);
        console.log(`📝 Environment: ${config.nodeEnv}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏳ Shutting down gracefully...');
    await fastify.close();
    process.exit(0);
});

start();
