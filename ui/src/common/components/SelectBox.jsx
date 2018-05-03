import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';

class SelectBox extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  render() {
    return (
      <Select
        style={{ width: this.props.width }}
        onChange={this.onChange}
        defaultValue={this.props.defaultValue}
      >
        {this.props.options.map(option =>
          <Select.Option key={option.value} value={option.value}>{option.display}</Select.Option>)}
      </Select>
    );
  }
}

SelectBox.propTypes = {
  defaultValue: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onChange: PropTypes.func,
  width: PropTypes.number,
};

SelectBox.defaultProps = {
  defaultValue: null,
  onChange: null,
  width: 140,
};

export default SelectBox;
