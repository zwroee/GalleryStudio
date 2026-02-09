import bcrypt from 'bcrypt';
import pool from '../config/database';
import { AdminUser, LoginRequest, LoginResponse } from '../types';

const SALT_ROUNDS = 10;

export class AuthService {
    /**
     * Create a new admin user (for initial setup)
     */
    static async createAdminUser(
        username: string,
        password: string,
        email: string
    ): Promise<AdminUser> {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query<AdminUser>(
            `INSERT INTO admin_users (username, password_hash, email)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [username, passwordHash, email]
        );

        return result.rows[0];
    }

    /**
     * Authenticate admin user and return user data
     */
    static async login(credentials: LoginRequest): Promise<AdminUser | null> {
        const result = await pool.query<AdminUser>(
            'SELECT * FROM admin_users WHERE username = $1',
            [credentials.username]
        );

        if (result.rows.length === 0) {
            return null;
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(credentials.password, user.password_hash);

        if (!isValid) {
            return null;
        }

        return user;
    }

    /**
     * Get admin user by ID
     */
    static async getUserById(id: string): Promise<AdminUser | null> {
        const result = await pool.query<AdminUser>(
            'SELECT * FROM admin_users WHERE id = $1',
            [id]
        );

        return result.rows[0] || null;
    }

    /**
     * Verify gallery password
     */
    static async verifyGalleryPassword(
        galleryId: string,
        password: string
    ): Promise<boolean> {
        const result = await pool.query<{ password_hash: string | null }>(
            'SELECT password_hash FROM galleries WHERE id = $1',
            [galleryId]
        );

        if (result.rows.length === 0) {
            return false;
        }

        const { password_hash } = result.rows[0];

        // If no password set, gallery is public
        if (!password_hash) {
            return true;
        }

        return bcrypt.compare(password, password_hash);
    }

    /**
     * Hash a password for gallery protection
     */
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }
}
