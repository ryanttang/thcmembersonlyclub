import Image from "next/image";
import { getResponsiveImageSizes } from "@/lib/utils";
import { IMAGE_CONFIG } from "@/config/images";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ResponsiveImage({
  src,
  alt,
  className = "",
  fill = false,
  width,
  height,
  sizes = "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 300px",
  priority = false,
  placeholder = "blur",
  blurDataURL,
  quality = 85,
  onLoad,
  onError
}: ResponsiveImageProps) {
  // Get responsive image sizes for the source
  const imageSizes = getResponsiveImageSizes(src);
  
  // Use medium size as default for better quality/performance balance
  const imageSrc = imageSizes.medium || src;

  return (
    <Image
      src={imageSrc}
      alt={alt}
      className={className}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      sizes={sizes}
      priority={priority}
      placeholder={placeholder}
      blurDataURL={blurDataURL || IMAGE_CONFIG.PLACEHOLDER}
      quality={quality}
      onLoad={onLoad}
      onError={onError}
      style={{
        objectFit: 'cover',
        objectPosition: 'center'
      }}
    />
  );
}
