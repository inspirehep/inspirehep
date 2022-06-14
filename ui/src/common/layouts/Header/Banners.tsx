import React from 'react';

import { getConfigFor } from '../../config';
import BannerContainer from './BannerContainer';

function Banners() {
  const banners = getConfigFor('BANNERS', []);
  return (
    <>
      {banners.map(({ id, ...rest }) => (
        <BannerContainer key={id} id={id} {...rest} />
      ))}
    </>
  );
}

export default Banners;
