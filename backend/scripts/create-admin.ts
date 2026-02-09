#!/usr/bin/env node

/**
 * Script to create the initial admin user
 * Usage: npm run create-admin
 */

import { AuthService } from '../src/services/auth.service';
import pool from '../src/config/database';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function question(query: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function createAdmin() {
    console.log('=== Create Admin User ===\n');

    const username = await question('Username: ');
    const email = await question('Email: ');
    const password = await question('Password: ');

    if (!username || !email || !password) {
        console.error('❌ All fields are required');
        process.exit(1);
    }

    try {
        const user = await AuthService.createAdminUser(username, password, email);
        console.log('\n✅ Admin user created successfully!');
        console.log(`   ID: ${user.id}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Email: ${user.email}`);
    } catch (err: any) {
        console.error('\n❌ Failed to create admin user:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
        rl.close();
    }
}

createAdmin();
