/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.addColumns('admin_users', {
        watermark_logo_path: {
            type: 'varchar(255)',
            default: null,
            comment: 'Path to the watermark logo image',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropColumns('admin_users', ['watermark_logo_path']);
};
