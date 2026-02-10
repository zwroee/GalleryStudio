/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // Add is_public column to galleries table
    pgm.addColumn('galleries', {
        is_public: {
            type: 'boolean',
            notNull: true,
            default: false,
            comment: 'Whether gallery appears on public gallery list',
        },
    });

    // Create index for faster public gallery queries
    pgm.createIndex('galleries', 'is_public', { name: 'idx_galleries_is_public' });
};

exports.down = (pgm) => {
    // Remove index and column
    pgm.dropIndex('galleries', 'is_public', { name: 'idx_galleries_is_public' });
    pgm.dropColumn('galleries', 'is_public');
};
