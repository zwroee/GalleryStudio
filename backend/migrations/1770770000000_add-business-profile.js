/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Add business_name
    pgm.sql(`
        ALTER TABLE "admin_users" 
        ADD COLUMN IF NOT EXISTS "business_name" varchar(255) DEFAULT 'FIVE FEATHERS PHOTOGRAPHY';
    `);

    // Add website
    pgm.sql(`
        ALTER TABLE "admin_users" 
        ADD COLUMN IF NOT EXISTS "website" varchar(255) DEFAULT 'www.5feathersphotography.com';
    `);

    // Add phone
    pgm.sql(`
        ALTER TABLE "admin_users" 
        ADD COLUMN IF NOT EXISTS "phone" varchar(50) DEFAULT '209-900-2315';
    `);

    // Add profile_picture_path
    pgm.sql(`
        ALTER TABLE "admin_users" 
        ADD COLUMN IF NOT EXISTS "profile_picture_path" varchar(255) DEFAULT NULL;
    `);

    pgm.sql(`
        COMMENT ON COLUMN "admin_users"."profile_picture_path" IS 'Path to the business profile picture';
    `);
};

exports.down = (pgm) => {
    pgm.dropColumns('admin_users', ['business_name', 'website', 'phone', 'profile_picture_path']);
};
