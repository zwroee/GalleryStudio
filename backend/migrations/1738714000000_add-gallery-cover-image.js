exports.shorthands = undefined;

exports.up = pgm => {
    pgm.sql(`
        ALTER TABLE "galleries" 
        ADD COLUMN IF NOT EXISTS "cover_image_path" text;
    `);
};

exports.down = pgm => {
    pgm.dropColumns('galleries', ['cover_image_path']);
};
