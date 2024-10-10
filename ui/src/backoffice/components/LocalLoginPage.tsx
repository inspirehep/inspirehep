import React from 'react';
import { Row, Card, Button, Input } from 'antd';
import { Field, Form, Formik } from 'formik';
import DocumentHead from '../../common/components/DocumentHead';
import { Credentials } from '../../types';

const LocalLoginPage = ({
  onLoginFormSubmit,
}: {
  onLoginFormSubmit: ((values: {}) => void | Promise<any>) & Function;
}) => {
  function renderFormInput({
    form,
    field,
    ...rest
  }: {
    form: any;
    field: JSX.Element;
    rest: any;
  }) {
    return <Input {...field} {...rest} />;
  }

  function renderLoginForm(formik: any) {
    return (
      <Form>
        <Row className="mb3">
          <Field
            name="email"
            type="email"
            placeholder="Email"
            data-test-id="email"
            data-testid="email"
            component={renderFormInput}
          />
        </Row>
        <Row className="mb3">
          <Field
            name="password"
            type="password"
            placeholder="Password"
            data-test-id="password"
            data-testid="password"
            component={renderFormInput}
          />
        </Row>
        <Button
          className="w-100"
          type="primary"
          htmlType="submit"
          data-test-id="login"
          data-testid="login"
          disabled={!(formik.isValid && formik.dirty)}
        >
          Login
        </Button>
      </Form>
    );
  }

  return (
    <>
      <DocumentHead title="Login" />
      <Row className="h-100" justify="center" align="middle">
        <Card bodyStyle={{ textAlign: 'center' }}>
          <h1 className="b mb4 f5">
            Please log in with your Backoffice account
          </h1>
          <Formik
            onSubmit={(creds: Credentials) => onLoginFormSubmit(creds)}
            initialValues={{ email: null, password: null }}
          >
            {(formik: any) => renderLoginForm(formik)}
          </Formik>
        </Card>
      </Row>
    </>
  );
};

export default LocalLoginPage;
