import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';

interface ActionsDropdownProps {
  canAdd?: boolean;
  canRemove?: boolean;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
  disabled: boolean;
  title: string;
}

function ActionsDropdown({
  canAdd = true,
  canRemove = true,
  onAddClick,
  onRemoveClick,
  disabled,
  title,
}: ActionsDropdownProps) {
  const actions = [
    canAdd
      ? {
          key: 'add',
          label: (
            <Button type="link" onClick={onAddClick} style={{ width: '100%' }}>
              Add new
            </Button>
          ),
        }
      : undefined,
    canRemove
      ? {
          key: 'delete',
          label: (
            <Button
              type="link"
              danger
              onClick={onRemoveClick}
              style={{ width: '100%' }}
            >
              Delete
            </Button>
          ),
        }
      : undefined,
  ];
  return (
    <div data-testid={title} className="w100">
      <Dropdown
        menu={{ items: actions.filter((action) => action !== undefined) }}
        trigger={['click']}
        disabled={disabled}
        styles={{
          root: { width: '100px', minWidth: '100px' },
          item: { padding: 0 },
        }}
      >
        <Space styles={{ root: { width: '100%' } }}>
          {title}
          <CaretDownOutlined />
        </Space>
      </Dropdown>
    </div>
  );
}

export default ActionsDropdown;
