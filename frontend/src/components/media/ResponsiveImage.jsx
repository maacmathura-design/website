import React from 'react';

const srcSet = (small, smallWidth, full, fullWidth) => (
  [small && `${small} ${smallWidth}w`, full && `${full} ${fullWidth}w`].filter(Boolean).join(', ')
);

/** JPEG stays the fallback. AVIF and WebP are used when those files are smaller than the JPEG. */
const ResponsiveImage = ({ artwork, sizes = '100vw', alt = '', className, style, loading, fetchPriority, decoding = 'async', width, height }) => {
  const fullWidth = artwork.width || 1920;
  const smallWidth = artwork.widthSmall || 960;
  const avif = srcSet(artwork.avifSmall, smallWidth, artwork.avif, fullWidth);
  const webp = srcSet(artwork.webpSmall, smallWidth, artwork.webp, fullWidth);
  return (
    <picture>
      {avif && <source type="image/avif" srcSet={avif} sizes={sizes} />}
      {webp && <source type="image/webp" srcSet={webp} sizes={sizes} />}
      <img
        src={artwork.src}
        srcSet={srcSet(artwork.srcSmall, smallWidth, artwork.src, fullWidth)}
        sizes={sizes}
        alt={alt}
        className={className}
        style={style}
        loading={loading}
        fetchpriority={fetchPriority}
        decoding={decoding}
        width={width || artwork.width}
        height={height || artwork.height}
      />
    </picture>
  );
};

export default ResponsiveImage;
