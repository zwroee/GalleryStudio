exports.shorthands = undefined;

exports.up = pgm => {
    pgm.addColumns('galleries', {
        cover_image_path: { type: 'text' },
    });
};

exports.down = pgm => {
    pgm.dropColumns('galleries', ['cover_image_path']);
};
