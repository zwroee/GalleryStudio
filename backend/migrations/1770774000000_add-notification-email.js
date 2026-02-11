exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('admin_users', {
        notification_email: { type: 'text', default: null },
    });
};

exports.down = pgm => {
    pgm.dropColumns('admin_users', ['notification_email']);
};
