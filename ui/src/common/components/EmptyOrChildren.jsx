import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List, Map } from 'immutable';
import { Empty } from 'antd';

function isEmptyCollection(data) {
  return (
    data == null ||
    Object.keys(data).length === 0 || // object/array
    data.size === 0 // Map/List
  );
}

class EmptyOrChildren extends Component {
  render() {
    const { data, children, description } = this.props;
    return isEmptyCollection(data) ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    ) : (
      children
    );
  }
}

EmptyOrChildren.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.instanceOf(List),
    PropTypes.instanceOf(Map),
  ]),
  description: PropTypes.string,
  children: PropTypes.node,
};

export default EmptyOrChildren;
