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
}: $TSFixMe) {
  const query = {};
  if (min) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    (query as $TSFixMe).minWidth = SIZE_TO_MIN_WIDTH[min];
  }

  if (max) {
    // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    (query as $TSFixMe).maxWidth = SIZE_TO_MAX_WIDTH[max];
  }

  return useMedia(query);
}
