import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { SelectOptionsPropType } from '../propTypes';

function SelectBox({
  options,
  virtualScroll = false,
  ...selectProps
}: any) {
  return (
    <Select dropdownMatchSelectWidth={virtualScroll} showArrow {...selectProps}>
      {options.map((option: any) => <Select.Option key={option.value} value={option.value}>
        <span
          data-test-id={
            selectProps['data-test-id'] &&
            `${selectProps['data-test-id']}-option-${option.value}`
          }
        >
          {option.display || option.value}
        </span>
      </Select.Option>)}
    </Select>
  );
}

SelectBox.propTypes = {
  options: SelectOptionsPropType.isRequired,
  virtualScroll: PropTypes.bool,
};

export default SelectBox;
