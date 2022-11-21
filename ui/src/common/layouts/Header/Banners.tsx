import React from 'react';

import { getConfigFor } from '../../config';
import BannerContainer from './BannerContainer';
import { BannerProps } from './Banner';

function Banners() {
  const banners: BannerProps[] = getConfigFor('BANNERS', []);

  return (
    <>
      {banners.map(({ id, ...rest }) => (
        <BannerContainer key={id} id={id} {...rest} />
      ))}
    </>
  );
}

export default Banners;
