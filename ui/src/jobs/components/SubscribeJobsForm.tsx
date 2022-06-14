import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Field, Form, Formik } from 'formik';
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

function SubscribeJobsForm({ onSubmit }) {
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

SubscribeJobsForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default SubscribeJobsForm;
