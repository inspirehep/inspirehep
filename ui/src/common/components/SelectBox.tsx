import React, { ComponentPropsWithoutRef } from 'react';
import { Select } from 'antd';

interface SelectProps extends ComponentPropsWithoutRef<any> {
  options: { display?: string; value: string }[];
  onChange?: Function;
  virtualScroll?: boolean;
}

function SelectBox(selectProps: SelectProps) {
  return (
    <Select
      dropdownMatchSelectWidth={selectProps.virtualScroll}
      showArrow
      {...selectProps}
      options={selectProps.options?.map((option) => ({
        value: option.value,
        label: (
          <span
            data-test-id={
              selectProps['data-test-id'] &&
              `${selectProps['data-test-id']}-option-${option.value}`
            }
          >
            {option.display || option.value}
          </span>
        ),
      }))}
    />
  );
}

export default SelectBox;
