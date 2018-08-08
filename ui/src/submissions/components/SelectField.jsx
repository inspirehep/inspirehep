/* eslint-disable react/prop-types */
import React, { Component } from 'react';

import SelectBox from '../../common/components/SelectBox';
import withFormItem from '../withFormItem';

class SelectField extends Component {
  constructor(props) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onBlur() {
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(value) {
    const { form, name } = this.props;
    form.setFieldValue(name, value);
  }

  render() {
    const { value, ...otherProps } = this.props;
    return (
      <SelectBox
        {...otherProps}
        defaultValue={value}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}

export default withFormItem(SelectField);
