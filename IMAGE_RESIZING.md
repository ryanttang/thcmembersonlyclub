# Automatic Image Resizing

This project now includes automatic image resizing functionality that optimizes uploaded images for different display contexts.

## Features

- **Automatic Resizing**: Images are automatically resized to multiple dimensions when uploaded
- **Grid Optimization**: Thumbnail size (300x225) is optimized for grid display with 4:3 aspect ratio
- **Responsive Loading**: Different image sizes are loaded based on device and display context
- **Performance**: Smaller images load faster, improving page performance
- **Quality Control**: Images are optimized with appropriate quality settings for each size

## Image Sizes Generated

| Size | Dimensions | Quality | Use Case |
|------|------------|---------|----------|
| `thumbnail` | 300x225 | 85% | Grid display, cards |
| `medium` | 600x450 | 85% | Medium displays, tablets |
| `large` | 1200x900 | 90% | High-res displays, desktops |
| `original` | Original | 90% | Full-size viewing |

## How It Works

### 1. Upload Process
When an image is uploaded via the admin interface:
- Image is validated for type, size, and dimensions
- Sharp library processes the image to create multiple sizes
- All sizes are saved (locally or to S3)
- Thumbnail URL is returned as the main display URL

### 2. Display Process
The `ResponsiveImage` component:
- Starts with thumbnail for fast loading
- Preloads larger sizes in the background
- Automatically falls back to original if resized versions fail
- Provides smooth loading transitions

### 3. Configuration
Image settings are centralized in `src/config/images.ts`:
- Size dimensions
- Quality settings
- File type restrictions
- Maximum dimensions

## Technical Implementation

### Dependencies
- `sharp`: High-performance image processing
- `@types/sharp`: TypeScript definitions

### Key Components
- `ResponsiveImage`: React component for responsive image loading
- `getImageUrl()`: Utility for getting specific image sizes
- `getResponsiveImageSizes()`: Utility for getting all available sizes

### File Structure
```
src/
├── components/
│   ├── ResponsiveImage.tsx    # Responsive image component
│   └── EventCard.tsx          # Updated to use responsive images
├── config/
│   └── images.ts              # Image configuration
├── lib/
│   └── utils.ts               # Image utility functions
└── app/api/upload/
    └── route.ts               # Updated upload endpoint
```

## Usage

### Basic Usage
```tsx
import ResponsiveImage from '@/components/ResponsiveImage';

<ResponsiveImage
  src={event.flyerUrl}
  alt={event.title}
  fill
  className="object-cover"
/>
```

### Getting Specific Sizes
```tsx
import { getImageUrl } from '@/lib/utils';

const thumbnailUrl = getImageUrl(imageUrl, 'thumbnail');
const largeUrl = getImageUrl(imageUrl, 'large');
```

### Getting All Sizes
```tsx
import { getResponsiveImageSizes } from '@/lib/utils';

const sizes = getResponsiveImageSizes(imageUrl);
// Returns: { thumbnail, medium, large, original }
```

## Benefits

1. **Performance**: Smaller images load faster, improving page load times
2. **User Experience**: Smooth loading with placeholder images and transitions
3. **Bandwidth**: Users download appropriately sized images for their device
4. **SEO**: Better Core Web Vitals scores due to optimized images
5. **Maintenance**: Centralized configuration makes it easy to adjust settings

## Configuration

To modify image settings, edit `src/config/images.ts`:

```typescript
export const IMAGE_CONFIG = {
  SIZES: {
    thumbnail: {
      width: 300,      // Change thumbnail width
      height: 225,     // Change thumbnail height
      quality: 85,     // Adjust quality
      format: 'jpeg'   // Change format
    },
    // ... other sizes
  }
};
```

## Troubleshooting

### Common Issues

1. **Sharp Installation**: Ensure `sharp` is properly installed
   ```bash
   npm install sharp @types/sharp
   ```

2. **Memory Issues**: Large images may cause memory issues during processing
   - Reduce `MAX_DIMENSIONS` in config
   - Process images in smaller batches

3. **Format Support**: Ensure uploaded images are in supported formats
   - JPEG, PNG, WebP, GIF are supported
   - All output is converted to JPEG for consistency

4. **Preview Not Resized**: If admin preview shows large images
   - Check that `ResponsiveImage` component is used instead of `<img>` tags
   - Verify that existing events use new URL format
   - New uploads will automatically use resized format

5. **Legacy Image Support**: Existing images before resizing was implemented
   - Old images will display at original size (fallback behavior)
   - New uploads will automatically be resized
   - Consider re-uploading important images for optimization

### Performance Tips

1. **Batch Processing**: Process multiple images sequentially to avoid memory issues
2. **Caching**: Consider implementing image caching for frequently accessed sizes
3. **CDN**: Use CDN for serving images in production for better performance

## Future Enhancements

- [ ] WebP format support for modern browsers
- [ ] Progressive JPEG loading
- [ ] Image lazy loading with Intersection Observer
- [ ] Automatic image compression based on content
- [ ] Cloud-based image processing for scalability
