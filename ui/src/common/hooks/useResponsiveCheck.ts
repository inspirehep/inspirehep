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
  max
}: any) {
  const query = {};
  if (min) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'minWidth' does not exist on type '{}'.
    query.minWidth = SIZE_TO_MIN_WIDTH[min];
  }

  if (max) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'maxWidth' does not exist on type '{}'.
    query.maxWidth = SIZE_TO_MAX_WIDTH[max];
  }

  return useMedia(query);
}
