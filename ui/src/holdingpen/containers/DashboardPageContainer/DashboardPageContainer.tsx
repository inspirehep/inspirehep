import React from 'react';

import './DashboardPageContainer.less';

interface DashboardPageContainerProps {
  data?: any;
}

const DashboardPage: React.FC<DashboardPageContainerProps> = () => {
  return (
    <div
      className="__DashboardPageContainer__"
      data-testid="holdingpen-dashboard-page"
    >
      Dashboard Page
    </div>
  );
};

export default DashboardPage;
