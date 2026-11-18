import { WidgetProps } from '@rjsf/utils';
import { Input } from 'antd';

import ViewRecordWidget from './ViewRecordWidget';

function RecordRefWidget(props: WidgetProps) {
  const {
    id,
    value,
    disabled,
    readonly,
    placeholder,
    onChange,
    onBlur,
    onFocus,
  } = props;

  return (
    <div>
      <Input
        id={id}
        placeholder={placeholder}
        disabled={disabled || readonly}
        value={value ?? ''}
        onChange={(event) =>
          onChange(event.target.value === '' ? undefined : event.target.value)
        }
        onBlur={() => onBlur(id, value)}
        onFocus={() => onFocus(id, value)}
      />
      <ViewRecordWidget {...props} />
    </div>
  );
}

export default RecordRefWidget;
