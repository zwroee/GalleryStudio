/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.sql(`
        ALTER TABLE "admin_users" 
        ADD COLUMN IF NOT EXISTS "watermark_logo_path" varchar(255) DEFAULT NULL;
    `);
    pgm.sql(`
        COMMENT ON COLUMN "admin_users"."watermark_logo_path" IS 'Path to the watermark logo image';
    `);
};

exports.down = (pgm) => {
    pgm.dropColumns('admin_users', ['watermark_logo_path']);
};
