import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'antd';

class DropdownMenu extends Component {
  renderMenu() {
    const { children, onClick } = this.props;
    return <Menu onClick={onClick}>{children}</Menu>;
  }

  render() {
    const { title, disabled, overlayClassName } = this.props;
    return (
      <Dropdown
        disabled={disabled}
        overlay={this.renderMenu()}
        overlayClassName={overlayClassName}
      >
        {title}
      </Dropdown>
    );
  }
}

DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  overlayClassName: PropTypes.string,
};

DropdownMenu.defaultProps = {
  disabled: false,
};

export default DropdownMenu;
