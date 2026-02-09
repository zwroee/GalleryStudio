import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth.service';
import { loginSchema, validateBody } from '../middleware/validation';
import { LoginRequest } from '../types';

export default async function authRoutes(fastify: FastifyInstance) {
    /**
     * POST /api/auth/login
     * Admin login endpoint
     */
    fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const credentials = validateBody(loginSchema, request.body);

            const user = await AuthService.login(credentials);

            if (!user) {
                return reply.status(401).send({ error: 'Invalid credentials' });
            }

            // Generate JWT token
            const token = fastify.jwt.sign({
                id: user.id,
                username: user.username,
            });

            return {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            };
        } catch (err) {
            request.log.error(err);
            return reply.status(400).send({ error: 'Invalid request' });
        }
    });

    /**
     * GET /api/auth/verify
     * Verify JWT token
     */
    fastify.get('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            const payload = request.user as { id: string; username: string };
            const user = await AuthService.getUserById(payload.id);

            if (!user) {
                return reply.status(401).send({ error: 'User not found' });
            }

            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            };
        } catch (err) {
            return reply.status(401).send({ error: 'Invalid token' });
        }
    });
}
