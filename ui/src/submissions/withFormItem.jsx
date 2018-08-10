/* eslint-disable react/prop-types */

import React, { Component } from 'react';
import { Form } from 'antd';
import { getIn } from 'formik';
import classNames from 'classnames';

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
    getWrapperColForOnlyChild() {
      const { label, labelCol } = this.props;
      if (label && labelCol) {
        const span = 24 - labelCol.span;
        return { span };
      }
      return { span: 24 };
    }

    shouldDisplayError() {
      const { field, form } = this.props;
      const { touched, errors } = form;
      const { name } = field;
      return Boolean(getIn(touched, name) && getIn(errors, name));
    }

    render() {
      const {
        field,
        form,
        label,
        suffixText,
        labelCol,
        wrapperCol,
        onlyChild,
        ...props
      } = this.props;
      const { errors } = form;
      const { name } = field;
      const shouldDisplayError = this.shouldDisplayError();
      return (
        <Form.Item
          className={classNames({ 'mb4-important': onlyChild })}
          hasFeedback={shouldDisplayError}
          validateStatus={shouldDisplayError ? 'error' : ''}
          help={getIn(errors, name)}
          label={label}
          labelCol={label ? labelCol : null}
          wrapperCol={onlyChild ? this.getWrapperColForOnlyChild() : wrapperCol}
        >
          <FormInputComponent {...field} {...props} form={form} />
          {suffixText && <span className="ant-form-text">{suffixText}</span>}
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
