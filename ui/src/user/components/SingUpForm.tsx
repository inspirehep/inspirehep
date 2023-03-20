import React, { useCallback } from 'react';
import { Row, Col, Button } from 'antd';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';

import TextField from '../../submissions/common/components/TextField';

const SCHEMA = object().shape({
  email: string().email().trim().required().label('Email'),
});

const FULL_ROW = { span: 24 };

function SingUpForm({
  loading,
  onSignUp,
}: {
  loading: boolean;
  onSignUp: ((
    values: {},
    formikHelpers: FormikHelpers<{}>
  ) => void | Promise<any>) &
    Function;
}) {
  return (
    <Formik validationSchema={SCHEMA} initialValues={{}} onSubmit={onSignUp}>
      {(props) => (
        <Form>
          <Field
            wrapperCol={FULL_ROW}
            name="email"
            type="email"
            placeholder="Email"
            component={TextField}
            disabled={loading}
            data-testid="email"
          />
          <Row justify="end">
            <Col>
              <Button
                loading={loading}
                disabled={!props.isValid}
                type="primary"
                htmlType="submit"
                data-testid="submit"
              >
                Sign up
              </Button>
            </Col>
          </Row>
        </Form>
      )}
    </Formik>
  );
}

export default SingUpForm;
