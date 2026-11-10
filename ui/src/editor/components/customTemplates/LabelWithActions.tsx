import { useRef } from 'react';
import { Button, Space } from 'antd';

interface LabelWithActionsProps {
  canAdd?: boolean;
  canRemove?: boolean;
  canUpload?: boolean;
  onAddClick?: () => void;
  onRemoveClick?: () => void;
  onUpload?: (file: File) => void;
  disabled: boolean;
  title: string;
}

const BUTTON_STYLE = {
  background: 'transparent',
  fontSize: 11,
  height: 20,
  padding: '0',
};

function LabelWithActions({
  canAdd = true,
  canRemove = true,
  canUpload = false,
  onAddClick,
  onRemoveClick,
  onUpload,
  disabled,
  title,
}: LabelWithActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      data-testid={title}
      style={{ width: '100%', display: 'flex', alignItems: 'center' }}
    >
      <span style={{ flex: 1 }}>{title}</span>
      <Space size={12}>
        {canAdd && (
          <Button
            variant="link"
            style={BUTTON_STYLE}
            size="small"
            color="blue"
            disabled={disabled}
            onClick={onAddClick}
          >
            Add new
          </Button>
        )}
        {canUpload && (
          <div>
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
            <Button
              variant="link"
              style={BUTTON_STYLE}
              size="small"
              color="blue"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload
            </Button>
          </div>
        )}
        {canRemove && (
          <Button
            variant="link"
            style={BUTTON_STYLE}
            size="small"
            color="red"
            disabled={disabled}
            onClick={onRemoveClick}
          >
            Delete
          </Button>
        )}
      </Space>
    </div>
  );
}

export default LabelWithActions;
