import React from 'react';
import { Select } from 'antd';

interface Option {
  value: string | number;
  display?: string;
}

interface SelectBoxProps {
  options: Option[];
  virtualScroll?: boolean;
  mode?: 'multiple' | 'tags';
  value?: string | string[] | number | number[];
  defaultValue?: string | string[] | number | number[];
  onChange?: Function;
  onBlur?: Function;
  disabled?: boolean;
  placeholder?: string;
  listHeight?: number;
  popupClassName?: string;
  'data-test-id'?: string;
  'data-test-type'?: string;
}

function SelectBox({
  options,
  virtualScroll = false,
  mode,
  value,
  defaultValue,
  onChange,
  onBlur,
  disabled,
  placeholder,
  listHeight,
  popupClassName,
  'data-test-id': dataTestId,
  'data-test-type': dataTestType,
}: SelectBoxProps) {
  return (
    <Select
      dropdownMatchSelectWidth={virtualScroll}
      showArrow
      mode={mode}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      data-testid="select-box"
      data-test-id={dataTestId}
      data-test-type={dataTestType}
      listHeight={listHeight}
      popupClassName={popupClassName}
    >
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          <span
            data-test-id={dataTestId && `${dataTestId}-option-${option.value}`}
          >
            {option.display || option.value}
          </span>
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectBox;
