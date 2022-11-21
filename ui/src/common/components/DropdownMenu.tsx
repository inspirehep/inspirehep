import React from 'react';
import { Menu, Dropdown } from 'antd';

const DropdownMenu = ({
  title,
  disabled,
  overlayClassName,
  children,
  onClick,
}: {
  title: any;
  disabled: boolean;
  className?: string;
  overlayClassName?: string;
  children?: any;
  onClick?: any;
}) => {
  const renderMenu = () => <Menu onClick={onClick}>{children}</Menu>;

  return (
    <Dropdown
      disabled={disabled}
      overlay={renderMenu()}
      overlayClassName={overlayClassName}
    >
      {title}
    </Dropdown>
  );
};

DropdownMenu.defaultProps = {
  disabled: false,
};

export default DropdownMenu;
