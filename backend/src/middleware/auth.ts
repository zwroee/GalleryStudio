import { FastifyRequest, FastifyReply } from 'fastify';

// Extend Fastify request type to include JWT payload
declare module 'fastify' {
    interface FastifyRequest {
        user?: {
            id: string;
            username: string;
        };
    }
}

// Authentication middleware for admin routes
export async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
    }
}
