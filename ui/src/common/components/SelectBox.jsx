import React, { Component } from 'react';
import { Select } from 'antd';
import { SelectOptionsPropType } from '../propTypes';

class SelectBox extends Component {
  render() {
    const { options, ...selectProps } = this.props;
    return (
      <Select dropdownMatchSelectWidth={false} showArrow {...selectProps}>
        {options.map(option => (
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
}

SelectBox.propTypes = {
  options: SelectOptionsPropType.isRequired,
  ...Select.propTypes,
};

export default SelectBox;
