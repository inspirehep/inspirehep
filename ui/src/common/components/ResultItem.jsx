import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

import './ResultItem.scss';

class ResultItem extends Component {
  render() {
    const { title, description, actions } = this.props;
    return (
      <List.Item
        className="__ResultItem__"
        actions={actions}
      >
        <List.Item.Meta
          title={title}
          description={description}
        />
        {this.props.children}
      </List.Item>
    );
  }
}

ResultItem.propTypes = {
  title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  description: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  children: PropTypes.arrayOf(PropTypes.node),
  actions: PropTypes.arrayOf(PropTypes.node),
};

ResultItem.defaultProps = {
  title: undefined,
  description: undefined,
  children: undefined,
  actions: undefined,
};

export default ResultItem;
