import { useState } from 'react';
import { Button, Checkbox, Input, Popover } from 'antd';
import { useReferencesActions } from '../../ReferencesActionsContext';
import removeEmptyValues from '../../utils/removeEmptyValues';
import { ToolbarActionsProps } from '../../types';

function ReferencesToolbarActions({
  formData,
  onChange,
  readonly,
  onReset,
}: ToolbarActionsProps) {
  const { extractReferences, linkReferences } = useReferencesActions();
  const [isExtractOpen, setIsExtractOpen] = useState(false);
  const [source, setSource] = useState('');
  const [replace, setReplace] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [linking, setLinking] = useState(false);

  const onExtract = async () => {
    setExtracting(true);
    const extracted = await extractReferences(source.trim());
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

  const onLink = async () => {
    setLinking(true);
    const linked = await linkReferences(removeEmptyValues(formData));
    setLinking(false);
    if (linked) {
      onChange(linked);
    }
  };

  return (
    <>
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
              placeholder="Text or URL (with http prefix)"
            />
            <div className="editor-list__extract-actions">
              <Checkbox
                checked={replace}
                onChange={(event) => setReplace(event.target.checked)}
              >
                Replace existing
              </Checkbox>
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
          Extract references
        </Button>
      </Popover>
      <Button
        size="small"
        loading={linking}
        disabled={readonly || formData.length === 0}
        onClick={onLink}
      >
        Refresh to link
      </Button>
    </>
  );
}

export default ReferencesToolbarActions;
