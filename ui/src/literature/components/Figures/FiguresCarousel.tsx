import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import Figure from './Figure';
import CarouselModal from '../../../common/components/CarouselModal';

const FiguresCarousel = forwardRef(({ figures, visible, onCancel }, ref) => (
  <CarouselModal visible={visible} onCancel={onCancel} ref={ref}>
    {figures.map(figure => (
      <Figure
        key={figure.get('url')}
        url={figure.get('url')}
        caption={figure.get('caption')}
      />
    ))}
  </CarouselModal>
));

FiguresCarousel.propTypes = {
  figures: PropTypes.instanceOf(List),
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

FiguresCarousel.displayName = 'FiguresCarousel';

export default FiguresCarousel;
