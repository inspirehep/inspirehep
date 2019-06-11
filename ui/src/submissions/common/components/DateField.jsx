/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';

import withFormItem from '../withFormItem';

class DateField extends Component {
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onBlur() {
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(date, dateString) {
    const { form, name } = this.props;
    form.setFieldValue(name, dateString);
  }

  render() {
    const { value, ...otherProps } = this.props;
    return (
      <DatePicker
        className="w-100"
        {...otherProps}
        data-test-type="date-picker"
        defaultValue={value && moment(value)}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}

export default withFormItem(DateField);
