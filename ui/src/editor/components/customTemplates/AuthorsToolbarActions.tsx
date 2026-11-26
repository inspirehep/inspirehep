import { useState } from 'react';
import { Button, Checkbox, Input, Popover } from 'antd';
import { useToolbarActions } from '../../ToolbarActionsContext';
import removeEmptyValues from '../../utils/removeEmptyValues';
import { ToolbarActionsProps } from '../../types';

function AuthorsToolbarActions({
  formData,
  onChange,
  readonly,
  onReset,
}: ToolbarActionsProps) {
  const { extractAuthors } = useToolbarActions();
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [source, setSource] = useState('');
  const [replace, setReplace] = useState(true);
  const [extracting, setExtracting] = useState(false);

  const onExtract = async () => {
    setExtracting(true);
    const extracted = await extractAuthors(source.trim());
    setExtracting(false);
    if (extracted) {
      const cleaned = removeEmptyValues(extracted);
      onChange(replace ? cleaned : [...formData, ...cleaned]);
      onReset?.();
      setIsExtractOpen(false);
      setSource('');
      setReplace(true);
    }
  };

  return (
    <Popover
      trigger="click"
      open={isExtractOpen}
      onOpenChange={setIsExtractOpen}
      content={
        <div className="editor-list__extract">
          <Input.TextArea
            rows={4}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="Text or Author XML or URL (with http prefix)"
          />
          <div className="editor-list__extract-actions">
            <Checkbox
              checked={replace}
              onChange={(event) => setReplace(event.target.checked)}
            >
              Replace existing
            </Checkbox>
            <a href="/authorlist-tool" target="_blank" rel="noreferrer">
              How to use
            </a>
            <Button
              type="primary"
              size="small"
              loading={extracting}
              disabled={readonly || !source.trim()}
              onClick={onExtract}
            >
              Extract
            </Button>
          </div>
        </div>
      }
    >
      <Button size="small" disabled={readonly}>
        Extract authors
      </Button>
    </Popover>
  );
}

export default AuthorsToolbarActions;
