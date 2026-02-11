import { FastifyInstance } from 'fastify';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/env';

async function listDir(dir: string): Promise<any[]> {
    try {
        const files = await fs.readdir(dir, { withFileTypes: true });
        const results = await Promise.all(files.map(async (file) => {
            const fullPath = path.join(dir, file.name);
            const stats = await fs.stat(fullPath);
            const item: any = {
                name: file.name,
                path: fullPath,
                type: file.isDirectory() ? 'dir' : 'file',
                size: stats.size,
                mode: (stats.mode & 0o777).toString(8), // octal permissions
                uid: stats.uid,
                gid: stats.gid,
            };
            if (file.isDirectory()) {
                item.children = await listDir(fullPath);
            }
            return item;
        }));
        return results;
    } catch (err: any) {
        return [{ error: err.message, path: dir }];
    }
}

export default async function debugRoutes(fastify: FastifyInstance) {
    fastify.get('/fs', async (request, reply) => {
        const root = config.storagePath;
        const tree = await listDir(root);
        return {
            tree,
            cwd: process.cwd(),
            env: {
                STORAGE_PATH: process.env.STORAGE_PATH,
                NODE_ENV: process.env.NODE_ENV
            }
        };
    });
}
