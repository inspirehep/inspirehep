/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { InputNumber } from 'antd';

import withFormItem from '../withFormItem';

class NumberField extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    const { form, name } = this.props;
    form.setFieldValue(name, value);
  }

  render() {
    return (
      <InputNumber
        {...this.props}
        onChange={this.onChange}
        style={{ width: '100%' }}
      />
    );
  }
}

export default withFormItem(NumberField);
