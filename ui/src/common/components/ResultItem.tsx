import React from 'react';

import ContentBox from './ContentBox';

const ResultItem = ({
  leftActions,
  rightActions,
  children,
}: {
  leftActions?: JSX.Element[] | JSX.Element | any;
  rightActions?: JSX.Element[] | JSX.Element | any;
  children?: JSX.Element[] | JSX.Element | any;
}) => (
  <ContentBox leftActions={leftActions} rightActions={rightActions}>
    {children}
  </ContentBox>
);

export default ResultItem;
