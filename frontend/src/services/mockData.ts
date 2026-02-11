import { Gallery, GalleryWithPhotos, LoginResponse, Photo } from '../types';

export const MOCK_USER: LoginResponse['user'] = {
    id: 'demo-user-id',
    username: 'demo_admin',
    email: 'demo@gallerystudio.com',
    business_name: 'Gallery Studio Demo',
    website: 'https://gallerystudio.demo',
    phone: '555-0123',
    profile_picture_path: null,
    watermark_logo_path: null
};

export const MOCK_GALLERIES: Gallery[] = [
    {
        id: 'gallery-1',
        title: 'Summer Wedding 2024',
        description: 'Beautiful garden wedding ceremony and reception.',
        cover_image_path: 'demo/wedding.jpg',
        created_at: new Date('2024-06-15').toISOString(),
        updated_at: new Date('2024-06-15').toISOString(),
        is_public: true,
        password_hash: null, // No password for demo
        allow_downloads: true,
        allow_favorites: true,
        photo_count: 42,
        view_count: 1250,
        download_count: 85,
        favorite_count: 322,
        // expires_at is optional and undefined if not set
    },
    {
        id: 'gallery-2',
        title: 'Mountain Elopement',
        description: 'Intimate sunset session in the mountains.',
        cover_image_path: 'demo/mountain.jpg',
        created_at: new Date('2024-07-20').toISOString(),
        updated_at: new Date('2024-07-20').toISOString(),
        is_public: true,
        password_hash: 'hashed_password', // Mock password protection
        allow_downloads: false,
        allow_favorites: true,
        photo_count: 15,
        view_count: 450,
        download_count: 0,
        favorite_count: 89,
    },
    {
        id: 'gallery-3',
        title: 'Urban Portrait Session',
        description: 'City vibes and street photography style.',
        cover_image_path: 'demo/urban.jpg',
        created_at: new Date('2024-08-05').toISOString(),
        updated_at: new Date('2024-08-05').toISOString(),
        is_public: false, // Private gallery
        password_hash: null,
        allow_downloads: true,
        allow_favorites: false,
        photo_count: 28,
        view_count: 0, // Private
        download_count: 0,
        favorite_count: 0,
    }
];

export const MOCK_GALLERY_WITH_PHOTOS: GalleryWithPhotos = {
    ...MOCK_GALLERIES[0],
    photos: Array.from({ length: 12 }).map((_, i) => ({
        id: `photo-${i}`,
        gallery_id: 'gallery-1',
        filename: `demo-photo-${i}.jpg`,
        original_filename: `IMG_${1000 + i}.jpg`,
        file_path: `galleries/gallery-1/photos/demo-photo-${i}.jpg`,
        file_size: 2500000,
        mime_type: 'image/jpeg',
        processing_status: 'completed',
        upload_order: i,
        content_type: 'image/jpeg',
        width: 1920,
        height: 1080,
        camera_make: 'Canon',
        camera_model: 'EOS R5',
        lens: '85mm f/1.2',
        exposure_time: '1/200',
        aperture: 'f/2.8',
        iso: 400,
        focal_length: '85mm',
        taken_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        is_favorited: i % 3 === 0 // Some favorites
    })) as Photo[]
};

export const MOCK_PORTFOLIO_IMAGES = Array.from({ length: 8 }).map((_, i) => ({
    id: `portfolio-${i}`,
    url: `https://picsum.photos/800/800?random=${i}`,
    category: i % 2 === 0 ? 'WEDDING' : 'FAMILY',
    width: 800,
    height: 800,
    created_at: new Date().toISOString()
}));

export const MOCK_PORTFOLIO_PROFILE = {
    business_name: 'Gallery Studio Demo',
    website: 'https://gallerystudio.demo',
    phone: '555-0123',
    email: 'demo@gallerystudio.com',
    profile_picture_path: 'https://ui-avatars.com/api/?name=Gallery+Studio&background=0D8ABC&color=fff&size=256'
};
