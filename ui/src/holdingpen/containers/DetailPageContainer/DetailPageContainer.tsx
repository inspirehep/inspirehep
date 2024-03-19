import React from 'react';

import './DetailPageContainer.less';

interface DetailPageContainerProps {
  data?: any;
}

const DetailPageContainer: React.FC<DetailPageContainerProps> = () => {
  return (
    <div
      className="__DetailPageContainer__"
      data-testid="holdingpen-detail-page"
    >
      Detail Page
    </div>
  );
};

export default DetailPageContainer;
