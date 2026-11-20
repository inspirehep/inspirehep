import { useRef } from 'react';
import { CaretDownOutlined } from '@ant-design/icons';
import { Button, Dropdown, Space } from 'antd';

interface ActionsDropdownProps {
  canAdd?: boolean;
  canRemove?: boolean;
  canUpload?: boolean;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
  onUpload?: (file: File) => void;
  disabled: boolean;
  title: string;
}

function ActionsDropdown({
  canAdd = true,
  canRemove = true,
  canUpload = false,
  onAddClick,
  onRemoveClick,
  onUpload,
  disabled,
  title,
}: ActionsDropdownProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    canUpload
      ? {
          key: 'upload',
          label: (
            <Button
              type="link"
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%' }}
            >
              Upload
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
      {canUpload && (
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept="application/pdf"
          data-testid={`${title}-upload-input`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload?.(file);
            }
            event.target.value = '';
          }}
        />
      )}
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
