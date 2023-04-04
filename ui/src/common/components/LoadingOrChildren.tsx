import React from 'react';

import Loading from './Loading';

const LoadingOrChildren = ({
  children,
  loading,
}: {
  children: any;
  loading: boolean;
}) => (loading ? <Loading /> : <>{children}</>);

export default LoadingOrChildren;
