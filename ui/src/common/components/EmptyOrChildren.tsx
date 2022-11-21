import React from 'react';
import { List, Map } from 'immutable';
import { Empty } from 'antd';

function isEmptyCollection(data: any) {
  return (
    data != null &&
    (Object.keys(data).length === 0 || // object/array
      data.size === 0) // Map/List
  );
}

const EmptyOrChildren = ({
  data,
  children,
  title,
  description,
}: {
  data: any;
  children: JSX.Element;
  title: string;
  description?: string;
}) => {
  return isEmptyCollection(data) ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={title}>
      {description}
    </Empty>
  ) : (
    children
  );
};

export default EmptyOrChildren;
