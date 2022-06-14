import React, { Component } from 'react';
import { Menu, Dropdown } from 'antd';

type OwnProps = {
    title: React.ReactNode;
    onClick?: $TSFixMeFunction;
    disabled?: boolean;
    overlayClassName?: string;
};

type Props = OwnProps & typeof DropdownMenu.defaultProps;

class DropdownMenu extends Component<Props> {

static defaultProps = {
    disabled: false,
};

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

export default DropdownMenu;
