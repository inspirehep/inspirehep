import React from 'react';

import { getConfigFor } from '../../config';
import BannerContainer from './BannerContainer';

function Banners() {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'never[]' is not assignable to pa... Remove this comment to see the full error message
  const banners = getConfigFor('BANNERS', []);
  return <>
    {banners.map(({
      id,
      ...rest
    }: any) => (
      <BannerContainer key={id} id={id} {...rest} />
    ))}
  </>;
}

export default Banners;
