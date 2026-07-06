import { Dropdown } from 'antd';

type DropdownMenuProps = {
  title: any;
  disabled?: boolean;
  overlayClassName?: string;
  items?: any[];
  onClick?: any;
};

const DropdownMenu = ({
  title,
  disabled = false,
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

export default DropdownMenu;
