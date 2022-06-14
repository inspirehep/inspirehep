import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Menu, Dropdown } from 'antd';

class DropdownMenu extends Component {
  renderMenu() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onClick' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { children, onClick } = this.props;
    return <Menu onClick={onClick}>{children}</Menu>;
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'title' does not exist on type 'Readonly<... Remove this comment to see the full error message
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
DropdownMenu.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  overlayClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
DropdownMenu.defaultProps = {
  disabled: false,
};

export default DropdownMenu;
