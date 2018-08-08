/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { Form } from 'antd';

import { getWrappedComponentDisplayName } from '../common/utils';

/**
 * Wraps component with From.Item to provide error display, label.
 *
 * Componet that is wrapped must be used be used as formik's <Field component={...}/>
 * to have necessary form state like error, touched
 *
 * @param FormInputComponent input component to be used as formik's <Field component={...}/>
 */
export default function withFormItem(FormInputComponent) {
  class WithFormItem extends Component {
    shouldDisplayError() {
      const { field, form } = this.props;
      const { touched, errors } = form;
      const { name } = field;
      return Boolean(touched[name] && errors[name]);
    }

    render() {
      const { field, form, label, labelCol, wrapperCol, ...props } = this.props;
      const { errors } = form;
      const { name } = field;
      const shouldDisplayError = this.shouldDisplayError();
      return (
        <Form.Item
          hasFeedback={shouldDisplayError}
          validateStatus={shouldDisplayError ? 'error' : ''}
          help={errors[name]}
          label={label}
          labelCol={labelCol}
          wrapperCol={wrapperCol}
        >
          <FormInputComponent {...field} {...props} form={form} />
        </Form.Item>
      );
    }
  }
  WithFormItem.defaultProps = {
    labelCol: { span: 5 },
    wrapperCol: { span: 19 },
  };
  WithFormItem.displayName = getWrappedComponentDisplayName(
    'WithFormItem',
    FormInputComponent
  );
  return WithFormItem;
}
