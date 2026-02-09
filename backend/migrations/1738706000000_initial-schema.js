/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Enable UUID extension
    pgm.createExtension('pgcrypto', { ifNotExists: true });

    // Create admin_users table
    pgm.createTable('admin_users', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        username: {
            type: 'varchar(100)',
            notNull: true,
            unique: true,
        },
        password_hash: {
            type: 'varchar(255)',
            notNull: true,
        },
        email: {
            type: 'varchar(255)',
            notNull: true,
            unique: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    // Create galleries table
    pgm.createTable('galleries', {
        id: {
            type: 'uuid',
            primaryKey: true,
            default: pgm.func('gen_random_uuid()'),
        },
        title: {
            type: 'varchar(255)',
            notNull: true,
        },
        description: {
            type: 'text',
        },
        password_hash: {
            type: 'varchar(255)',
            comment: 'NULL means public gallery, hash means password-protected',
        },
        allow_downloads: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
        allow_favorites: {
            type: 'boolean',
            notNull: true,
            default: true,
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    // Create photos table
    pgm.createTable('photos', {
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
        filename: {
            type: 'varchar(255)',
            notNull: true,
        },
        file_path: {
            type: 'varchar(500)',
            notNull: true,
            comment: 'Relative path from storage root',
        },
        width: {
            type: 'integer',
            notNull: true,
        },
        height: {
            type: 'integer',
            notNull: true,
        },
        file_size: {
            type: 'bigint',
            notNull: true,
            comment: 'File size in bytes',
        },
        mime_type: {
            type: 'varchar(50)',
            notNull: true,
        },
        processing_status: {
            type: 'varchar(20)',
            notNull: true,
            default: "'pending'",
            comment: 'pending, processing, completed, failed',
        },
        upload_order: {
            type: 'integer',
            comment: 'For maintaining upload order',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    // Create favorites table
    pgm.createTable('favorites', {
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
            type: 'varchar(255)',
            notNull: true,
            comment: 'Anonymous session tracking for clients',
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('NOW()'),
        },
    });

    // Create indexes for performance
    pgm.createIndex('photos', 'gallery_id', { name: 'idx_photos_gallery' });
    pgm.createIndex('photos', 'processing_status', { name: 'idx_photos_status' });
    pgm.createIndex('favorites', 'photo_id', { name: 'idx_favorites_photo' });
    pgm.createIndex('favorites', 'session_id', { name: 'idx_favorites_session' });

    // Create unique constraint on favorites (one favorite per photo per session)
    pgm.addConstraint('favorites', 'unique_photo_session', {
        unique: ['photo_id', 'session_id'],
    });

    // Create trigger to update updated_at on galleries
    pgm.createFunction(
        'update_updated_at_column',
        [],
        {
            returns: 'trigger',
            language: 'plpgsql',
            replace: true,
        },
        `
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    `
    );

    pgm.createTrigger('galleries', 'update_galleries_updated_at', {
        when: 'BEFORE',
        operation: 'UPDATE',
        function: 'update_updated_at_column',
        level: 'ROW',
    });
};

exports.down = (pgm) => {
    // Drop tables in reverse order (respecting foreign keys)
    pgm.dropTable('favorites', { cascade: true });
    pgm.dropTable('photos', { cascade: true });
    pgm.dropTable('galleries', { cascade: true });
    pgm.dropTable('admin_users', { cascade: true });

    // Drop function and extension
    pgm.dropFunction('update_updated_at_column', [], { cascade: true });
    pgm.dropExtension('pgcrypto');
};
