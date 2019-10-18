import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Empty } from 'antd';

class EmptyOrChildren extends Component {
  render() {
    const { data, children, description } = this.props;
    return data == null || Object.keys(data).length === 0 ? (
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
    ) : (
      children
    );
  }
}

EmptyOrChildren.propTypes = {
  data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  description: PropTypes.string,
  children: PropTypes.node,
};

export default EmptyOrChildren;
