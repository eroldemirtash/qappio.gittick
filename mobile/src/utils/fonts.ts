// Font utilities for consistent font usage across the app
export const fonts = {
  comfortaa: {
    regular: 'Comfortaa_400Regular',
    bold: 'Comfortaa_700Bold',
  },
} as const;

// Common font styles
export const fontStyles = {
  heading: {
    fontFamily: fonts.comfortaa.bold,
    fontSize: 24,
    fontWeight: '700' as const,
  },
  subheading: {
    fontFamily: fonts.comfortaa.bold,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  body: {
    fontFamily: fonts.comfortaa.regular,
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: fonts.comfortaa.regular,
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontFamily: fonts.comfortaa.regular,
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontFamily: fonts.comfortaa.bold,
    fontSize: 16,
    fontWeight: '700' as const,
  },
} as const;

