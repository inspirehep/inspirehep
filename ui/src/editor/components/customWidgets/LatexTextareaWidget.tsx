import { useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { Input } from 'antd';

import Latex from '../../../common/components/Latex';

function LatexTextareaWidget({
  id,
  value,
  disabled,
  readonly,
  placeholder,
  options,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) {
  const [editing, setEditing] = useState(false);
  const isLocked = disabled || readonly;

  if (value && !editing) {
    return (
      <div
        id={id}
        className="latex-field latex-preview"
        data-testid="latex-preview"
        role="button"
        tabIndex={isLocked ? -1 : 0}
        onClick={() => !isLocked && setEditing(true)}
        onFocus={() => !isLocked && setEditing(true)}
      >
        <Latex>{value}</Latex>
      </div>
    );
  }

  return (
    <div className="latex-field">
      <Input.TextArea
        id={id}
        autoFocus={editing}
        autoSize={{ minRows: 3 }}
        placeholder={placeholder}
        disabled={isLocked}
        value={value ?? ''}
        onChange={(event) =>
          onChange(
            event.target.value === '' ? options.emptyValue : event.target.value
          )
        }
        onFocus={() => {
          setEditing(true);
          onFocus(id, value);
        }}
        onBlur={() => {
          setEditing(false);
          onBlur(id, value);
        }}
      />
    </div>
  );
}

export default LatexTextareaWidget;
