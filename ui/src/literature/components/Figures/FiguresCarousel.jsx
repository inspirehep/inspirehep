import React from 'react';
import PropTypes from 'prop-types';
import { Carousel, Modal } from 'antd';
import { List } from 'immutable';

import Latex from '../../../common/components/Latex';
import Figure from './Figure';

function FiguresCarousel({ figures, visible, onCancel, carouselRef }) {
  return (
    <Modal
      title="Figures"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      centered
    >
      <Carousel ref={carouselRef} arrows lazyLoad="progressive">
        {figures.map(figure => (
          <div key={figure.get('key')} className="ph3">
            <div className="pb3">
              <Figure figure={figure} />
            </div>
            {figure.has('caption') && (
              <div className="pb3">
                <Latex>{figure.get('caption')}</Latex>
              </div>
            )}
          </div>
        ))}
      </Carousel>
    </Modal>
  );
}

FiguresCarousel.propTypes = {
  figures: PropTypes.instanceOf(List),
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  carouselRef: PropTypes.object,
};

export default FiguresCarousel;
