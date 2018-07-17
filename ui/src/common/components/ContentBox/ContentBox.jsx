import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';

import './ContentBox.scss';

class ContentBox extends Component {
  render() {
    const { title, actions, loading } = this.props;

    return (
      <div className="__ContentBox__">
        <Card title={title} loading={loading}>
          <div className="pa3">{this.props.children}</div>
          <div className="pb3">{actions}</div>
        </Card>
      </div>
    );
  }
}

ContentBox.propTypes = {
  actions: PropTypes.node,
  children: PropTypes.node,
  title: PropTypes.string,
  loading: PropTypes.bool,
};

ContentBox.defaultProps = {
  actions: null,
  children: null,
  title: null,
  loading: false,
};

export default ContentBox;
