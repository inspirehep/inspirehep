import React, { Component } from 'react';
import { List, Map } from 'immutable';
import { Empty } from 'antd';

function isEmptyCollection(data: $TSFixMe) {
  return (
    data != null &&
    (Object.keys(data).length === 0 || // object/array
      data.size === 0) // Map/List
  );
}

type Props = {
    data?: $TSFixMe[] | $TSFixMe | $TSFixMe | $TSFixMe; // TODO: PropTypes.instanceOf(Map)
    title?: string;
    description?: React.ReactNode;
};

class EmptyOrChildren extends Component<Props> {

  render() {
    const { data, children, title, description } = this.props;
    return isEmptyCollection(data) ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={title}>
        {description}
      </Empty>
    ) : (
      children
    );
  }
}

export default EmptyOrChildren;
