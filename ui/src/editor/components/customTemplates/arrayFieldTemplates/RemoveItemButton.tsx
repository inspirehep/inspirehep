import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd';

interface RemoveItemButtonProps {
  onClick: () => void;
  disabled: boolean;
}

function RemoveItemButton({ onClick, disabled }: RemoveItemButtonProps) {
  return (
    <Button
      type="text"
      aria-label="Remove item"
      icon={<CloseOutlined />}
      onClick={onClick}
      disabled={disabled}
    />
  );
}

export default RemoveItemButton;
