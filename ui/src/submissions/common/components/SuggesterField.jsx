/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import Suggester from '../../../common/components/Suggester';

import withFormItem from '../withFormItem';

class SuggesterField extends Component {
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
    return (
      <Suggester
        {...this.props}
        onBlur={this.onBlur}
        onChange={this.onChange}
      />
    );
  }
}

export default withFormItem(SuggesterField);
