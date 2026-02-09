exports.up = (pgm) => {
    // Add expiration date to galleries
    pgm.addColumn('galleries', {
        expires_at: {
            type: 'timestamp',
            notNull: false,
        },
    });

    // Add statistics columns to galleries
    pgm.addColumn('galleries', {
        view_count: {
            type: 'integer',
            notNull: true,
            default: 0,
        },
    });

    pgm.addColumn('galleries', {
        download_count: {
            type: 'integer',
            notNull: true,
            default: 0,
        },
    });

    // Create photo_views table for tracking
    pgm.createTable('photo_views', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        photo_id: {
            type: 'uuid',
            notNull: true,
            references: 'photos',
            onDelete: 'CASCADE',
        },
        session_id: {
            type: 'text',
            notNull: true,
        },
        viewed_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });

    // Create indexes for performance
    pgm.createIndex('photo_views', 'photo_id');
    pgm.createIndex('photo_views', 'session_id');
};

exports.down = (pgm) => {
    pgm.dropTable('photo_views');
    pgm.dropColumn('galleries', 'download_count');
    pgm.dropColumn('galleries', 'view_count');
    pgm.dropColumn('galleries', 'expires_at');
};
