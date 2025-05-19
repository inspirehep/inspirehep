import React from 'react';
import { Spin } from 'antd';
import { Img } from 'react-image';

import useResponsiveCheck from '../../hooks/useResponsiveCheck';
import CarouselModal from '../CarouselModal';
import LinkWithTargetBlank from '../LinkWithTargetBlank';
import { BLOG_URL } from '../../constants';
import { GUIDE_STEPS_MOBILE, GUIDE_STEPS_DESKTOP } from './steps';

const IMAGE_LOADER = (
  <Spin style={{ margin: 'auto', display: 'block', padding: '2rem 0' }} />
);

function GuideModal({
  visible,
  onCancel,
}: {
  visible: boolean;
  onCancel: Function;
}) {
  const isMobile = useResponsiveCheck({ max: 'md' });
  const guideSteps = isMobile ? GUIDE_STEPS_MOBILE : GUIDE_STEPS_DESKTOP;
  return (
    <CarouselModal visible={visible} onCancel={onCancel}>
      <div className="f2 tc bg-white pa5">
        <p>Welcome to INSPIRE!</p>
        <p className="mb0">Take the tour to discover new INSPIRE features.</p>
      </div>
      {guideSteps.map((step) => (
        <Img key={step} loader={IMAGE_LOADER} alt="Guide Step" src={step} />
      ))}
      <div className="f2 tc bg-white pa5">
        <p>Thanks for taking the tour of the new INSPIRE!</p>
        <p className="mb0">
          Visit{' '}
          <LinkWithTargetBlank href={BLOG_URL}>our blog</LinkWithTargetBlank>{' '}
          for more info.
        </p>
      </div>
    </CarouselModal>
  );
}

export default GuideModal;
