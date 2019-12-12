import React, { Component } from 'react';
import { Form, Tooltip } from 'antd';
import { getIn } from 'formik';
import classNames from 'classnames';

import { getWrappedComponentDisplayName } from '../../common/utils';

export const LABEL_COL = { sm: { span: 24 }, md: { span: 5 } };
export const WRAPPER_COL = {
  sm: { span: 24 },
  md: { span: 24 - LABEL_COL.md.span },
};

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
        return WRAPPER_COL;
      }
      return { span: 24 };
    }

    renderError() {
      const { field, form } = this.props;
      const { errors } = form;
      const { name } = field;
      const errorMessage = getIn(errors, name);
      return (
        errorMessage && (
          <span data-test-id={`${field.name}-error`}>{errorMessage}</span>
        )
      );
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
      const renderedError = this.renderError();
      return (
        <Form.Item
          className={classNames({ 'mb4-important': onlyChild })}
          hasFeedback={renderedError != null}
          validateStatus={renderedError ? 'error' : ''}
          help={renderedError}
          label={label && <Tooltip title={label}>{label}</Tooltip>}
          labelCol={label ? labelCol : null}
          wrapperCol={onlyChild ? this.getWrapperColForOnlyChild() : wrapperCol}
        >
          <FormInputComponent
            data-test-id={field.name}
            {...field}
            {...props}
            form={form}
          />
          {suffixText && <span className="ant-form-text">{suffixText}</span>}
        </Form.Item>
      );
    }
  }

  WithFormItem.defaultProps = {
    labelCol: LABEL_COL,
    wrapperCol: WRAPPER_COL,
  };

  WithFormItem.displayName = getWrappedComponentDisplayName(
    'WithFormItem',
    FormInputComponent
  );
  return WithFormItem;
}
