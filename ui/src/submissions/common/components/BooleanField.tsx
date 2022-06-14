import React, { Component } from 'react';
import { Checkbox } from 'antd';

import withFormItem from '../withFormItem';

class BooleanField extends Component {
  constructor(props: any) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  onChange(event: $TSFixMe) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldValue(name, event.target.checked);
    form.setFieldTouched(name, true);
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { value } = this.props;
    return (
      <Checkbox {...this.props} checked={value} onChange={this.onChange} />
    );
  }
}

export default withFormItem(BooleanField);
