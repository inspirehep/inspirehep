import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import Figure from './Figure';
import CarouselModal from '../../../common/components/CarouselModal';

// @ts-expect-error ts-migrate(2339) FIXME: Property 'figures' does not exist on type '{ child... Remove this comment to see the full error message
const FiguresCarousel = forwardRef(({ figures, visible, onCancel }, ref) => (
  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: any; visible: any; onCancel: any... Remove this comment to see the full error message
  <CarouselModal visible={visible} onCancel={onCancel} ref={ref}>
    {figures.map((figure: any) => <Figure
      key={figure.get('url')}
      url={figure.get('url')}
      caption={figure.get('caption')}
    />)}
  </CarouselModal>
));

FiguresCarousel.propTypes = {
  // @ts-expect-error ts-migrate(2322) FIXME: Type '{ figures: PropTypes.Requireable<unknown>; v... Remove this comment to see the full error message
  figures: PropTypes.instanceOf(List),
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

FiguresCarousel.displayName = 'FiguresCarousel';

export default FiguresCarousel;
