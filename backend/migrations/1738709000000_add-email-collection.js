exports.up = (pgm) => {
    // Create gallery_access_emails table to store client emails
    pgm.createTable('gallery_access_emails', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        gallery_id: {
            type: 'uuid',
            notNull: true,
            references: 'galleries',
            onDelete: 'CASCADE',
        },
        email: {
            type: 'text',
            notNull: true,
        },
        session_id: {
            type: 'text',
            notNull: false,
        },
        accessed_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('CURRENT_TIMESTAMP'),
        },
    });

    // Create indexes for performance
    pgm.createIndex('gallery_access_emails', 'gallery_id');
    pgm.createIndex('gallery_access_emails', 'email');
    pgm.createIndex('gallery_access_emails', ['gallery_id', 'email']);
};

exports.down = (pgm) => {
    pgm.dropTable('gallery_access_emails');
};
