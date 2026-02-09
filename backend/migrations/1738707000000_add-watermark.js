exports.up = (pgm) => {
    // Add watermark_logo_path column to admin_users table
    pgm.addColumn('admin_users', {
        watermark_logo_path: {
            type: 'text',
            notNull: false,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumn('admin_users', 'watermark_logo_path');
};
