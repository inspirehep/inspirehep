import React from 'react';
import { Select } from 'antd';

function SelectBox({ options, virtualScroll = false, ...selectProps }) {
  return (
    <Select dropdownMatchSelectWidth={virtualScroll} showArrow {...selectProps}>
      {options.map((option) => (
        <Select.Option key={option.value} value={option.value}>
          <span
            data-test-id={
              selectProps['data-test-id'] &&
              `${selectProps['data-test-id']}-option-${option.value}`
            }
          >
            {option.display || option.value}
          </span>
        </Select.Option>
      ))}
    </Select>
  );
}

export default SelectBox;
