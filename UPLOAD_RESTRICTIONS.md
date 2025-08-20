# Flyer Upload Restrictions

This document outlines the restrictions and validation rules for flyer uploads in the admin console.

## File Size Limits
- **Maximum file size**: 5MB
- Files exceeding this limit will be rejected with an error message

## Image Dimensions
- **Maximum dimensions**: 1920×1920 pixels
- Both width and height must be within this limit
- Images with larger dimensions will be rejected

## Supported File Types
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- GIF (.gif)

## Validation Process

### Client-Side Validation
- File type checking
- File size validation
- Image dimension validation using browser APIs
- Immediate feedback to users before upload

### Server-Side Validation
- Additional security layer
- File signature verification
- Header-based dimension extraction
- Final validation before storage

## Error Messages

Users will see specific error messages for:
- Invalid file types
- Files too large
- Images with excessive dimensions
- Malformed image files

## Best Practices

### For Optimal Performance
- Use JPEG for photographs (good compression)
- Use PNG for graphics with transparency
- Use WebP for modern browsers (best compression)
- Keep dimensions under 1200×1200 for faster loading

### File Size Optimization
- Compress images before upload
- Consider using online tools like TinyPNG or Squoosh
- Remove unnecessary metadata

## Technical Implementation

### Client-Side
- Uses HTML5 File API for validation
- Image dimensions extracted using Canvas API
- Real-time feedback during upload process

### Server-Side
- Binary file header analysis
- Support for multiple image formats
- Secure file handling with proper error responses

## Troubleshooting

### Common Issues
1. **"File too large"**: Compress the image or reduce dimensions
2. **"Invalid file type"**: Ensure the file is a supported image format
3. **"Dimensions too large"**: Resize the image to fit within limits
4. **"Upload failed"**: Check network connection and try again

### Support
If you encounter persistent issues, contact the system administrator with:
- File type and size
- Error message details
- Browser and operating system information
