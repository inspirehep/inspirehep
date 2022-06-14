import React, { Component } from 'react';
import { Checkbox } from 'antd';

import withFormItem from '../withFormItem';

class BooleanField extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event) {
    const { form, name } = this.props;
    form.setFieldValue(name, event.target.checked);
    form.setFieldTouched(name, true);
  }

  render() {
    const { value } = this.props;
    return (
      <Checkbox {...this.props} checked={value} onChange={this.onChange} />
    );
  }
}

export default withFormItem(BooleanField);
