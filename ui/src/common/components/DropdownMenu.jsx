import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'antd';

class DropdownMenu extends Component {
  renderMenu() {
    const { children } = this.props;
    return <Menu>{children}</Menu>;
  }

  render() {
    const { title } = this.props;
    return <Dropdown overlay={this.renderMenu()}>{title}</Dropdown>;
  }
}

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
};

export default DropdownMenu;
