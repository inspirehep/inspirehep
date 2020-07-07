import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
import Image from 'react-image';
import useResponsiveCheck from '../../hooks/useResponsiveCheck';
import CarouselModal from '../CarouselModal';
import ExternalLink from '../ExternalLink';
import { BLOG_URL } from '../../constants';
import { GUIDE_STEPS_MOBILE, GUIDE_STEPS_DESKTOP } from './steps';

const IMAGE_LOADER = (
  <Spin style={{ margin: 'auto', display: 'block', padding: '2rem 0' }} />
);

function GuideModal({ visible, onCancel }) {
  const isMobile = useResponsiveCheck({ max: 'md' });
  const guideSteps = isMobile ? GUIDE_STEPS_MOBILE : GUIDE_STEPS_DESKTOP;
  return (
    <CarouselModal visible={visible} onCancel={onCancel}>
      <div className="f2 tc bg-white pa5">
        <p>Welcome to INSPIRE!</p>
        <p className="mb0">Take the tour to discover new INSPIRE features.</p>
      </div>
      {guideSteps.map(step => (
        <Image key={step} loader={IMAGE_LOADER} alt="Guide Step" src={step} />
      ))}
      <div className="f2 tc bg-white pa5">
        <p>Thanks for taking the tour of the new INSPIRE!</p>
        <p className="mb0">
          Visit <ExternalLink href={BLOG_URL}>our blog</ExternalLink> for more
          info.
        </p>
      </div>
    </CarouselModal>
  );
}

GuideModal.propTypes = {
  visible: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
};

export default GuideModal;
