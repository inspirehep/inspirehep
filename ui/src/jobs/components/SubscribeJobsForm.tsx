import React, { useCallback } from 'react';
import { Field, Form, Formik } from 'formik';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { object, string } from 'yup';
import { Button, Row, Col } from 'antd';

// TODO: extract core form fields to common
import TextField from '../../submissions/common/components/TextField';

const SCHEMA = object().shape({
  email: string()
    .email()
    .required()
    .label('Email'),
  first_name: string()
    .required()
    .label('First Name'),
  last_name: string()
    .required()
    .label('Last Name'),
});

const FULL_ROW = { span: 24 };

type Props = {
    onSubmit: $TSFixMeFunction;
};

function SubscribeJobsForm({ onSubmit }: Props) {
  const renderForm = useCallback(
    ({ isValid }) => (
      <Form>
        <Field
          wrapperCol={FULL_ROW}
          name="email"
          type="email"
          placeholder="Email"
          component={TextField}
        />
        <Field
          wrapperCol={FULL_ROW}
          name="first_name"
          placeholder="First Name"
          component={TextField}
        />
        <Field
          wrapperCol={FULL_ROW}
          name="last_name"
          placeholder="Last Name"
          component={TextField}
        />
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <Row type="flex" justify="end">
          <Col>
            <Button disabled={!isValid} type="primary" htmlType="submit">
              Subscribe
            </Button>
          </Col>
        </Row>
      </Form>
    ),
    []
  );

  return (
    <Formik validationSchema={SCHEMA} initialValues={{}} onSubmit={onSubmit}>
      {renderForm}
    </Formik>
  );
}

export default SubscribeJobsForm;
