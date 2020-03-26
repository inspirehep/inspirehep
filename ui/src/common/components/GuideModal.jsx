import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Carousel, Modal, Spin } from 'antd';
import Image from 'react-image';
import useResponsiveCheck from '../hooks/useResponsiveCheck';

const GUIDE_STEPS_DESKTOP = [
  'guide-step-1-desktop',
  'guide-step-2-desktop',
  'guide-step-3-desktop',
  'guide-step-4-desktop',
  'guide-step-5-desktop',
  'guide-step-6-desktop',
  'guide-step-7-desktop',
  'guide-step-8-desktop',
  'guide-step-9-desktop',
];

const GUIDE_STEPS_MOBILE = [
  'guide-step-1-mobile',
  'guide-step-2-mobile',
  'guide-step-3-mobile',
  'guide-step-4-mobile',
  'guide-step-5-mobile',
  'guide-step-6-mobile',
  'guide-step-7-mobile',
  'guide-step-8-mobile',
  'guide-step-9-mobile',
  'guide-step-10-mobile',
];

const IMAGE_LOADER = (
  <Spin style={{ margin: 'auto', display: 'block', padding: '2rem 0' }} />
);

function GuideModal({ visible, onCancel }) {
  const isMobile = useResponsiveCheck({ max: 'md' });
  const carouselRef = useRef();
  const modalWidth = isMobile ? '100%' : '65%';
  const guideSteps = isMobile ? GUIDE_STEPS_MOBILE : GUIDE_STEPS_DESKTOP;
  const onModalCancel = useCallback(
    () => {
      carouselRef.current.goTo(0, false);
      onCancel();
    },
    [onCancel]
  );
  return (
    <Modal
      width={modalWidth}
      title="Welcome to the new INSPIRE. Take the tour!"
      visible={visible}
      onCancel={onModalCancel}
      footer={null}
      centered
    >
      <Carousel
        ref={carouselRef}
        arrows
        dots={false}
        infinite={false}
        lazyLoad="progressive"
      >
        {guideSteps.map(step => (
          <Image
            key={step}
            className="ph3"
            loader={IMAGE_LOADER}
            alt={step}
            src={`/${step}.png`}
          />
        ))}
      </Carousel>
    </Modal>
  );
}

GuideModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default GuideModal;
