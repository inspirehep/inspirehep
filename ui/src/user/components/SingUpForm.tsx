import React, { useCallback } from 'react';
import { Row, Col, Button } from 'antd';
import { Field, Form, Formik } from 'formik';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object, string } from 'yup';

import TextField from '../../submissions/common/components/TextField';

const SCHEMA = object().shape({
  email: string()
    .email()
    .required()
    .label('Email'),
});

const FULL_ROW = { span: 24 };

type Props = {
    loading: boolean;
    onSubmit: $TSFixMeFunction;
};

function SingUpForm({ loading, onSubmit }: Props) {
  const renderForm = useCallback(
    ({ isValid }) => (
      <Form>
        <Field
          wrapperCol={FULL_ROW}
          name="email"
          type="email"
          placeholder="Email"
          component={TextField}
          disabled={loading}
        />
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <Row type="flex" justify="end">
          <Col>
            <Button
              loading={loading}
              disabled={!isValid}
              type="primary"
              htmlType="submit"
            >
              Sign up
            </Button>
          </Col>
        </Row>
      </Form>
    ),
    [loading]
  );
  return (
    <Formik validationSchema={SCHEMA} initialValues={{}} onSubmit={onSubmit}>
      {renderForm}
    </Formik>
  );
}

export default SingUpForm;
