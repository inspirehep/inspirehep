import useMedia from 'use-media';

const SIZE_TO_MAX_WIDTH = {
  xs: 575,
  sm: 767,
  md: 991,
  lg: 1199,
  xl: 1599,
};

const SIZE_TO_MIN_WIDTH = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

export default function useResponsiveCheck({
  min,
  max,
}: {
  min?: keyof typeof SIZE_TO_MIN_WIDTH;
  max: keyof typeof SIZE_TO_MAX_WIDTH;
}) {
  const query: { minWidth?: number; maxWidth?: number } = {};

  if (min) {
    query.minWidth = SIZE_TO_MIN_WIDTH[min];
  }

  if (max) {
    query.maxWidth = SIZE_TO_MAX_WIDTH[max];
  }

  return useMedia(query);
}
