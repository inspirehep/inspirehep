import React from 'react';
import { Menu, Dropdown } from 'antd';

const DropdownMenu = ({
  title,
  disabled,
  overlayClassName,
  items,
  onClick,
}: {
  title: any;
  disabled: boolean;
  className?: string;
  overlayClassName?: string;
  items?: any[];
  onClick?: any;
}) => {
  const renderMenu = () => <Menu onClick={onClick} items={items} />;

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
