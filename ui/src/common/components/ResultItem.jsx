import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'antd';

class ResultItem extends Component {
  render() {
    return (
      <List.Item>
        <List.Item.Meta
          title={this.props.title}
          description={this.props.description}
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
};

ResultItem.defaultProps = {
  title: undefined,
  description: undefined,
  children: undefined,
};

export default ResultItem;
