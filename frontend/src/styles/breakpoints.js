// Mirrors the breakpoint comment in tokens.css. Mobile is everything below `tablet`.
export const breakpoints = {
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export const mediaQuery = {
  tablet: `(min-width: ${breakpoints.tablet}px)`,
  desktop: `(min-width: ${breakpoints.desktop}px)`,
  wide: `(min-width: ${breakpoints.wide}px)`,
};
