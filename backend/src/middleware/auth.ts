import { FastifyRequest, FastifyReply } from 'fastify';

interface FastifyRequest {
    userData?: {
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
