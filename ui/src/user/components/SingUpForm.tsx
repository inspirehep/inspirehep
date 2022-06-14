import React, { useCallback } from 'react';
import { Row, Col, Button } from 'antd';
import { Field, Form, Formik } from 'formik';
import PropTypes from 'prop-types';
import { object, string } from 'yup';

import TextField from '../../submissions/common/components/TextField';

const SCHEMA = object().shape({
  email: string()
    .email()
    .required()
    .label('Email'),
});

const FULL_ROW = { span: 24 };

function SingUpForm({ loading, onSubmit }) {
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

SingUpForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SingUpForm;
