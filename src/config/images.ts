export const IMAGE_CONFIG = {
  // Maximum dimensions for uploaded images
  MAX_DIMENSIONS: {
    width: 1920,
    height: 1920
  },
  
  // Maximum file size (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Allowed image types
  ALLOWED_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'] as const,
  
  // Image sizes for different display contexts
  SIZES: {
    thumbnail: {
      width: 300,
      height: 300, // Square aspect ratio for consistent grid thumbnails
      quality: 85,
      format: 'jpeg'
    },
    medium: {
      width: 600,
      height: 600, // Square aspect ratio for medium displays
      quality: 85,
      format: 'jpeg'
    },
    large: {
      width: 1200,
      height: 1200, // Square aspect ratio for high-res displays
      quality: 90,
      format: 'jpeg'
    },
    original: {
      quality: 90,
      format: 'jpeg'
    }
  },
  
  // Responsive breakpoints for image loading
  BREAKPOINTS: {
    mobile: 640,
    tablet: 768,
    laptop: 1024,
    desktop: 1280,
    wide: 1536
  },
  
  // Default placeholder image
  PLACEHOLDER: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
} as const;

export type ImageSize = keyof typeof IMAGE_CONFIG.SIZES;
export type ImageFormat = 'jpeg' | 'png' | 'webp';
export type AllowedImageType = typeof IMAGE_CONFIG.ALLOWED_TYPES[number];
