import React from 'react';
import PropTypes from 'prop-types';
import { Spin } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import Image from 'react-image';
import useResponsiveCheck from '../../hooks/useResponsiveCheck';
import CarouselModal from '../CarouselModal';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../ExternalLink.tsx';
import { BLOG_URL } from '../../constants';
import { GUIDE_STEPS_MOBILE, GUIDE_STEPS_DESKTOP } from './steps';

const IMAGE_LOADER = (
  <Spin style={{ margin: 'auto', display: 'block', padding: '2rem 0' }} />
);

function GuideModal({
  visible,
  onCancel
}: any) {
  const isMobile = useResponsiveCheck({ max: 'md' });
  const guideSteps = isMobile ? GUIDE_STEPS_MOBILE : GUIDE_STEPS_DESKTOP;
  return (
    // @ts-expect-error ts-migrate(2322) FIXME: Type '{ children: (Element | Element[])[]; visible... Remove this comment to see the full error message
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
