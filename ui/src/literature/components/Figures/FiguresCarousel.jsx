import PropTypes from 'prop-types';
import { List } from 'immutable';

import Figure from './Figure';
import CarouselModal from '../../../common/components/CarouselModal';

const FiguresCarousel = ({ figures, visible, onCancel, initialIndex }) => (
  <CarouselModal
    visible={visible}
    onCancel={onCancel}
    initialIndex={initialIndex}
  >
    {figures.map((figure) => (
      <Figure
        key={figure.get('url')}
        url={figure.get('url')}
        caption={figure.get('caption')}
      />
    ))}
  </CarouselModal>
);

FiguresCarousel.propTypes = {
  figures: PropTypes.instanceOf(List),
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  initialIndex: PropTypes.number,
};

export default FiguresCarousel;
