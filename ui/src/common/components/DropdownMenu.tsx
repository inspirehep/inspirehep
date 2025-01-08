import React from 'react';
import { Dropdown } from 'antd';

type DropdownMenuProps = {
  title: any;
  disabled: boolean;
  overlayClassName?: string;
  items?: any[];
  onClick?: any;
};

const DropdownMenu = ({
  title,
  disabled,
  overlayClassName,
  items,
  onClick,
}: DropdownMenuProps) => (
  <Dropdown
    disabled={disabled}
    menu={{
      onClick,
      items,
    }}
    overlayClassName={overlayClassName}
  >
    {title}
  </Dropdown>
);

DropdownMenu.defaultProps = {
  disabled: false,
};

export default DropdownMenu;
