import { format } from "date-fns";

export function fmtDate(d: Date) {
  return format(d, "EEE, MMM d, yyyy");
}

export function requireAdmin(request: Request) {
  const token = process.env.ADMIN_TOKEN;
  const header = request.headers.get("x-admin-token") || "";
  
  console.log("requireAdmin check:"); // Debug log
  console.log("  - Expected token:", token); // Debug log
  console.log("  - Received header:", header); // Debug log
  console.log("  - Tokens match:", token === header); // Debug log
  
  if (!token || header !== token) {
    console.log("  - Access DENIED"); // Debug log
    return new Response("Unauthorized", { status: 401 });
  }
  
  console.log("  - Access GRANTED"); // Debug log
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

/**
 * Get the best image size for different display contexts
 * @param baseUrl - Base URL of the image (without size suffix)
 * @param size - Desired size (thumbnail, medium, large, original)
 * @returns Full URL for the specified size
 */
export function getImageUrl(baseUrl: string, size: 'thumbnail' | 'medium' | 'large' | 'original' = 'thumbnail'): string {
  // If empty or invalid URL, return as is
  if (!baseUrl || typeof baseUrl !== 'string') {
    return baseUrl || '';
  }

  // If the URL already contains a size suffix, return as is
  if (baseUrl.includes('_thumbnail') || baseUrl.includes('_medium') || baseUrl.includes('_large') || baseUrl.includes('_original')) {
    return baseUrl;
  }
  
  // For original size, always return the base URL
  if (size === 'original') {
    return baseUrl;
  }
  
  // Check if this looks like a new resized image format (contains 'flyers/' and UUID pattern)
  const isNewFormat = baseUrl.includes('flyers/') && /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(baseUrl);
  
  if (isNewFormat) {
    // Extract the base path and extension
    const lastDotIndex = baseUrl.lastIndexOf('.');
    if (lastDotIndex === -1) return baseUrl; // Fallback to original if no extension
    
    const basePath = baseUrl.substring(0, lastDotIndex);
    
    // For resized images, always use .jpg extension
    return `${basePath}_${size}.jpg`;
  }
  
  // For legacy images (old format), return the original URL as fallback
  // This ensures existing images still work even if resized versions don't exist
  return baseUrl;
}

/**
 * Get responsive image sizes for different breakpoints
 * @param baseUrl - Base URL of the image
 * @returns Object with different image sizes for responsive loading
 */
export function getResponsiveImageSizes(baseUrl: string) {
  return {
    thumbnail: getImageUrl(baseUrl, 'thumbnail'),
    medium: getImageUrl(baseUrl, 'medium'),
    large: getImageUrl(baseUrl, 'large'),
    original: getImageUrl(baseUrl, 'original')
  };
}
