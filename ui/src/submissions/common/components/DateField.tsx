import React, { Component } from 'react';
import { DatePicker } from 'antd';
import moment from 'moment';
import withFormItem from '../withFormItem';

class DateField extends Component {
  constructor(props: any) {
    super(props);
    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onBlur() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldTouched(name, true);
  }

  onChange(date: any, dateString: any) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { form, name } = this.props;
    form.setFieldValue(name, dateString);
  }

  render() {
    // HACK: not passing `name` in order to disable browser autocompletion
    // until https://github.com/ant-design/ant-design/issues/22499 is resolved
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'value' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { value, name, ...otherProps } = this.props;
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
