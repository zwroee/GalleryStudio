exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('admin_users', {
        notification_new_favorites: { type: 'boolean', default: false },
        notification_download_activity: { type: 'boolean', default: false },
        notification_weekly_summary: { type: 'boolean', default: false }
    });
};

exports.down = pgm => {
    pgm.dropColumns('admin_users', [
        'notification_new_favorites',
        'notification_download_activity',
        'notification_weekly_summary'
    ]);
};
