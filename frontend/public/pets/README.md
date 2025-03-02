# Virtual Pet Images

This directory contains images for the virtual pets feature.

## Required Images

Please add the following WebP files to this directory:

1. `cat.webp` - A friendly cat image
2. `dog.webp` - A happy dog image
3. `rabbit.webp` - A cute rabbit image
4. `hamster.webp` - A small hamster image
5. `bird.webp` - A cheerful bird image
6. `default.webp` - A default pet image (used as fallback)

## Image Requirements

- Format: WebP (better compression and quality than PNG)
- Size: 1028x1028 pixels
- Style: Cute, friendly, and consistent art style
- Background: Transparent
- Quality: High quality while maintaining reasonable file size
- Optimization: Use WebP compression to keep files under 200KB

## Image Optimization

For best performance:
1. Use WebP format for better compression
2. Ensure images are exactly 1028x1028 pixels
3. Use transparency where needed
4. Optimize with tools like:
   - Squoosh (https://squoosh.app)
   - WebP converter
   - ImageMagick

## Image Sources

You can obtain pet images from:
1. Licensed stock image websites
2. Commission an artist
3. Create custom illustrations
4. Use royalty-free pet illustrations

## File Naming

- Use lowercase letters
- Use hyphens for spaces
- Keep the exact names as listed above
- Example: `cat.webp`

## Note on Image Size

The 1028x1028 size is perfect for high-resolution displays while maintaining good performance. The Next.js Image component will automatically optimize and serve the appropriate size based on the device's requirements. 