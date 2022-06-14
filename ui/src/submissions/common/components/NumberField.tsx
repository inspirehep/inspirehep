import React, { Component } from 'react';
import { InputNumber } from 'antd';

import withFormItem from '../withFormItem';

class NumberField extends Component {
  constructor(props: any) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(value: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
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
