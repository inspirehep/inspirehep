import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

class SelectBox extends Component {
  render() {
    const { options, ...selectProps } = this.props;
    return (
      <Select {...selectProps}>
        {options.map(option => (
          <Select.Option
            data-test-id={`select-option-${option.value}`}
            key={option.value}
            value={option.value}
          >
            {option.display || option.value}
          </Select.Option>
        ))}
      </Select>
    );
  }
}

SelectBox.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      display: PropTypes.string,
    })
  ).isRequired,
  ...Select.propTypes,
};

export default SelectBox;
