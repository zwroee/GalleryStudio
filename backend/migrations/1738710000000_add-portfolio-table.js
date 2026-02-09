exports.up = pgm => {
    pgm.createTable('portfolio_images', {
        id: { type: 'uuid', default: pgm.func('gen_random_uuid()'), notNull: true, primaryKey: true },
        url: { type: 'varchar(255)', notNull: true },
        category: { type: 'varchar(50)', notNull: true, default: 'ALL' },
        height: { type: 'integer', notNull: true, default: 300 }, // Storing height for masonry layout
        width: { type: 'integer', notNull: true, default: 400 },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createIndex('portfolio_images', 'category');
    pgm.createIndex('portfolio_images', 'created_at');
};

exports.down = pgm => {
    pgm.dropTable('portfolio_images');
};
