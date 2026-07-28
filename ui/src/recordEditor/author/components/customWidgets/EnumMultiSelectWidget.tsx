import { WidgetProps } from '@rjsf/utils';
import { Select } from 'antd';

function EnumMultiSelectWidget({
  id,
  value,
  disabled,
  readonly,
  options,
  placeholder,
  onChange,
  onBlur,
  onFocus,
}: WidgetProps) {
  const { enumOptions } = options;

  return (
    <Select
      id={id}
      mode="multiple"
      allowClear
      showSearch
      style={{ width: '100%' }}
      placeholder={placeholder}
      disabled={disabled || readonly}
      value={value ?? []}
      options={enumOptions}
      optionFilterProp="label"
      onChange={(newValue: string[]) => onChange(newValue)}
      onBlur={() => onBlur(id, value)}
      onFocus={() => onFocus(id, value)}
    />
  );
}

export default EnumMultiSelectWidget;
