import React, { forwardRef } from 'react';
import { List } from 'immutable';

import Figure from './Figure';
import CarouselModal from '../../../common/components/CarouselModal';

type Props = {
    figures?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    visible: boolean;
    onCancel: $TSFixMeFunction;
};

const FiguresCarousel = forwardRef<$TSFixMe, Props>(({ figures, visible, onCancel }, ref) => (
  <CarouselModal visible={visible} onCancel={onCancel} ref={ref}>
    {figures.map((figure: $TSFixMe) => <Figure
      key={figure.get('url')}
      url={figure.get('url')}
      caption={figure.get('caption')}
    />)}
  </CarouselModal>
));

FiguresCarousel.displayName = 'FiguresCarousel';

export default FiguresCarousel;
