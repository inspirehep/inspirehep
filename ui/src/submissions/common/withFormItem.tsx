import React, { Component } from 'react';

import { Tooltip, Form } from 'antd';
import { getIn } from 'formik';
import classNames from 'classnames';

import { getWrapperComponentDisplayName } from '../../common/utils';

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
export default function withFormItem(FormInputComponent: any) {
  class WithFormItem extends Component {
    getWrapperColForOnlyChild() {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
      const { label, labelCol } = this.props;
      if (label && labelCol) {
        return WRAPPER_COL;
      }
      return { span: 24 };
    }

    renderError() {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'field' does not exist on type 'Readonly<... Remove this comment to see the full error message
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'field' does not exist on type 'Readonly<... Remove this comment to see the full error message
        field,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'form' does not exist on type 'Readonly<{... Remove this comment to see the full error message
        form,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'label' does not exist on type 'Readonly<... Remove this comment to see the full error message
        label,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'suffixText' does not exist on type 'Read... Remove this comment to see the full error message
        suffixText,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'labelCol' does not exist on type 'Readon... Remove this comment to see the full error message
        labelCol,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'wrapperCol' does not exist on type 'Read... Remove this comment to see the full error message
        wrapperCol,
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'onlyChild' does not exist on type 'Reado... Remove this comment to see the full error message
        onlyChild,
        ...props
      } = this.props;
      const renderedError = this.renderError();
      return (
        <Form.Item
          className={classNames({ 'mb2-important': onlyChild })}
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
          {suffixText && <span className="pl2">{suffixText}</span>}
        </Form.Item>
      );
    }
  }

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
  WithFormItem.defaultProps = {
    labelCol: LABEL_COL,
    wrapperCol: WRAPPER_COL,
  };

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'displayName' does not exist on type 'typ... Remove this comment to see the full error message
  WithFormItem.displayName = getWrapperComponentDisplayName(
    'WithFormItem',
    FormInputComponent
  );
  return WithFormItem;
}
