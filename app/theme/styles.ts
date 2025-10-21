import { Dimensions, Platform, StatusBar, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallDevice = SCREEN_WIDTH < 375;
const isLargeDevice = SCREEN_WIDTH > 414;

// Status bar height for different platforms
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;

// Common spacing constants
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

// Border radius constants
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  round: 9999,
};

// Shadow styles for different elevations
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Common container styles
export const Containers = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  sectionNoMargin: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
});

// Common card styles
export const Cards = StyleSheet.create({
  default: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  elevated: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.lg,
  },
  flat: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interactive: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
});

// Common button styles
export const Buttons = StyleSheet.create({
  primary: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryDisabled: {
    backgroundColor: Colors.gray,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  secondary: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryDisabled: {
    backgroundColor: Colors.lightGray,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray,
  },
  outline: {
    backgroundColor: Colors.transparent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  ghost: {
    backgroundColor: Colors.transparent,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  danger: {
    backgroundColor: Colors.error,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
});

// Common text styles
export const Typography = StyleSheet.create({
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textDark,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    lineHeight: 22,
  },

  // Body text
  bodyXL: {
    fontSize: 18,
    color: Colors.text,
    lineHeight: 26,
  },
  bodyL: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  bodyM: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  bodyS: {
    fontSize: 12,
    color: Colors.text,
    lineHeight: 16,
  },
  bodyXS: {
    fontSize: 10,
    color: Colors.text,
    lineHeight: 14,
  },

  // Caption text
  caption: {
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  captionSmall: {
    fontSize: 10,
    color: Colors.textLight,
    lineHeight: 14,
  },

  // Button text
  buttonL: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonM: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  buttonS: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },

  // Utility text
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  error: {
    fontSize: 12,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
  success: {
    fontSize: 12,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  link: {
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});

// Form element styles
export const Forms = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.label,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  inputFocused: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    ...Shadows.sm,
  },
  inputError: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  textAreaFocused: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    minHeight: 100,
    ...Shadows.sm,
  },
  helperText: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  errorText: {
    ...Typography.error,
  },
});

// Common layout styles
export const Layout = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowAround: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: {
    flexDirection: 'column',
  },
  columnCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  flex3: {
    flex: 3,
  },
  wrap: {
    flexWrap: 'wrap',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  selfStart: {
    alignSelf: 'flex-start',
  },
  selfCenter: {
    alignSelf: 'center',
  },
  selfEnd: {
    alignSelf: 'flex-end',
  },
  selfStretch: {
    alignSelf: 'stretch',
  },
});

// Common utility styles
export const Utilities = StyleSheet.create({
  // Spacing
  pXs: { padding: Spacing.xs },
  pSm: { padding: Spacing.sm },
  pMd: { padding: Spacing.md },
  pLg: { padding: Spacing.lg },
  pXl: { padding: Spacing.xl },

  ptXs: { paddingTop: Spacing.xs },
  ptSm: { paddingTop: Spacing.sm },
  ptMd: { paddingTop: Spacing.md },
  ptLg: { paddingTop: Spacing.lg },
  ptXl: { paddingTop: Spacing.xl },

  pbXs: { paddingBottom: Spacing.xs },
  pbSm: { paddingBottom: Spacing.sm },
  pbMd: { paddingBottom: Spacing.md },
  pbLg: { paddingBottom: Spacing.lg },
  pbXl: { paddingBottom: Spacing.xl },

  plXs: { paddingLeft: Spacing.xs },
  plSm: { paddingLeft: Spacing.sm },
  plMd: { paddingLeft: Spacing.md },
  plLg: { paddingLeft: Spacing.lg },
  plXl: { paddingLeft: Spacing.xl },

  prXs: { paddingRight: Spacing.xs },
  prSm: { paddingRight: Spacing.sm },
  prMd: { paddingRight: Spacing.md },
  prLg: { paddingRight: Spacing.lg },
  prXl: { paddingRight: Spacing.xl },

  pxXs: { paddingHorizontal: Spacing.xs },
  pxSm: { paddingHorizontal: Spacing.sm },
  pxMd: { paddingHorizontal: Spacing.md },
  pxLg: { paddingHorizontal: Spacing.lg },
  pxXl: { paddingHorizontal: Spacing.xl },

  pyXs: { paddingVertical: Spacing.xs },
  pySm: { paddingVertical: Spacing.sm },
  pyMd: { paddingVertical: Spacing.md },
  pyLg: { paddingVertical: Spacing.lg },
  pyXl: { paddingVertical: Spacing.xl },

  mXs: { margin: Spacing.xs },
  mSm: { margin: Spacing.sm },
  mMd: { margin: Spacing.md },
  mLg: { margin: Spacing.lg },
  mXl: { margin: Spacing.xl },

  mtXs: { marginTop: Spacing.xs },
  mtSm: { marginTop: Spacing.sm },
  mtMd: { marginTop: Spacing.md },
  mtLg: { marginTop: Spacing.lg },
  mtXl: { marginTop: Spacing.xl },

  mbXs: { marginBottom: Spacing.xs },
  mbSm: { marginBottom: Spacing.sm },
  mbMd: { marginBottom: Spacing.md },
  mbLg: { marginBottom: Spacing.lg },
  mbXl: { marginBottom: Spacing.xl },

  mlXs: { marginLeft: Spacing.xs },
  mlSm: { marginLeft: Spacing.sm },
  mlMd: { marginLeft: Spacing.md },
  mlLg: { marginLeft: Spacing.lg },
  mlXl: { marginLeft: Spacing.xl },

  mrXs: { marginRight: Spacing.xs },
  mrSm: { marginRight: Spacing.sm },
  mrMd: { marginRight: Spacing.md },
  mrLg: { marginRight: Spacing.lg },
  mrXl: { marginRight: Spacing.xl },

  mxXs: { marginHorizontal: Spacing.xs },
  mxSm: { marginHorizontal: Spacing.sm },
  mxMd: { marginHorizontal: Spacing.md },
  mxLg: { marginHorizontal: Spacing.lg },
  mxXl: { marginHorizontal: Spacing.xl },

  myXs: { marginVertical: Spacing.xs },
  mySm: { marginVertical: Spacing.sm },
  myMd: { marginVertical: Spacing.md },
  myLg: { marginVertical: Spacing.lg },
  myXl: { marginVertical: Spacing.xl },

  // Width & Height
  wFull: { width: '100%' },
  hFull: { height: '100%' },
  wScreen: { width: SCREEN_WIDTH },
  hScreen: { height: SCREEN_HEIGHT },

  // Borders
  border: { borderWidth: 1, borderColor: Colors.border },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.border },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: Colors.border },
  borderRight: { borderRightWidth: 1, borderRightColor: Colors.border },

  // Background colors
  bgPrimary: { backgroundColor: Colors.primary },
  bgWhite: { backgroundColor: Colors.white },
  bgBackground: { backgroundColor: Colors.background },
  bgSuccess: { backgroundColor: Colors.success },
  bgError: { backgroundColor: Colors.error },
  bgWarning: { backgroundColor: Colors.warning },
  bgInfo: { backgroundColor: Colors.info },
  bgTransparent: { backgroundColor: Colors.transparent },

  // Text colors
  textPrimary: { color: Colors.primary },
  textWhite: { color: Colors.white },
  textDark: { color: Colors.textDark },
  textLight: { color: Colors.textLight },
  textSuccess: { color: Colors.success },
  textError: { color: Colors.error },
  textWarning: { color: Colors.warning },

  // Text alignment
  textCenter: { textAlign: 'center' },
  textLeft: { textAlign: 'left' },
  textRight: { textAlign: 'right' },

  // Opacity
  opacity50: { opacity: 0.5 },
  opacity75: { opacity: 0.75 },

  // Overflow
  overflowHidden: { overflow: 'hidden' },

  // Position
  absolute: { position: 'absolute' },
  relative: { position: 'relative' },
  absoluteFill: { ...StyleSheet.absoluteFillObject },

  // Z-index
  zIndex0: { zIndex: 0 },
  zIndex10: { zIndex: 10 },
  zIndex20: { zIndex: 20 },
  zIndex30: { zIndex: 30 },
  zIndex40: { zIndex: 40 },
  zIndex50: { zIndex: 50 },
});

// Component-specific style generators
export const StyleGenerators = {
  // Generate shadow based on elevation
  shadow: (elevation: number) => ({
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: elevation / 2,
    },
    shadowOpacity: 0.1 + (elevation * 0.01),
    shadowRadius: elevation * 0.8,
    elevation,
  }),

  // Generate responsive font size
  responsiveFont: (baseSize: number) => ({
    fontSize: isSmallDevice ? baseSize - 2 : isLargeDevice ? baseSize + 2 : baseSize,
  }),

  // Generate responsive spacing
  responsiveSpacing: (baseSpacing: number) => ({
    margin: isSmallDevice ? baseSpacing - 2 : isLargeDevice ? baseSpacing + 2 : baseSpacing,
  }),

  // Create a circle
  circle: (size: number) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
  }),

  // Create a square
  square: (size: number) => ({
    width: size,
    height: size,
  }),

  // Create a container with max width
  container: (maxWidth: number = 1200) => ({
    width: '100%',
    maxWidth,
    alignSelf: 'center',
  }),
};

// Common style patterns
export const Patterns = StyleSheet.create({
  // Loading pattern
  loadingContainer: {
    ...Containers.centered,
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.bodyM,
    color: Colors.textLight,
    marginTop: Spacing.md,
  },

  // Empty state pattern
  emptyState: {
    ...Containers.centered,
    padding: Spacing.xl,
  },
  emptyStateIcon: {
    marginBottom: Spacing.md,
  },
  emptyStateText: {
    ...Typography.bodyM,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptyStateTitle: {
    ...Typography.h4,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  // Error state pattern
  errorContainer: {
    ...Containers.centered,
    padding: Spacing.xl,
  },
  errorText: {
    ...Typography.bodyM,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // Success state pattern
  successContainer: {
    ...Containers.centered,
    padding: Spacing.xl,
  },
  successText: {
    ...Typography.bodyM,
    color: Colors.success,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // Badge pattern
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  badgeText: {
    ...Typography.captionSmall,
    fontWeight: '600',
    color: Colors.white,
  },

  // Tag pattern
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tagText: {
    ...Typography.caption,
    fontWeight: '500',
  },

  // Avatar pattern
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.bodyM,
    color: Colors.white,
    fontWeight: '600',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarXLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },

  // Divider pattern
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  dividerHorizontal: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // Progress bar pattern
  progressBar: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
});

// Export all constants and styles
export default {
  // Constants
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  STATUSBAR_HEIGHT,
  isSmallDevice,
  isLargeDevice,

  // Spacing and layout
  Spacing,
  BorderRadius,
  Shadows,

  // Style groups
  Containers,
  Cards,
  Buttons,
  Typography,
  Forms,
  Layout,
  Utilities,

  // Generators and patterns
  StyleGenerators,
  Patterns,

  // Colors (re-export for convenience)
  Colors,
};