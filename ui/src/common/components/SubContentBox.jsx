import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';

class SubContentBox extends Component {
  render() {
    const { children, title } = this.props;

    return (
      children && (
        <Card>
          <div className="pa3">
            <h3>{title}</h3>
            <div className="pt2">{children}</div>
          </div>
        </Card>
      )
    );
  }
}

SubContentBox.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node,
};

SubContentBox.defaultProps = {
  title: null,
  children: null,
};

export default SubContentBox;
