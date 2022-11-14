import React from 'react';
import { Row, Card, Button, Input } from 'antd';
import { Field, Form, Formik, FormikHelpers } from 'formik';

import DocumentHead from '../../common/components/DocumentHead';

const LocalLoginPage = ({
  onLoginFormSubmit,
}: {
  onLoginFormSubmit: ((
    values: {},
    formikHelpers: FormikHelpers<{}>
  ) => void | Promise<any>) &
    Function;
}) => {
  function renderFormInput({ field, ...props }: { field: JSX.Element, props: any }) {
    return <Input {...field} {...props} />;
  }

  function renderLoginForm() {
    return (
      <Form>
        <Row className="mb3">
          <Field
            name="email"
            type="email"
            placeholder="Email"
            data-test-id="email"
            component={renderFormInput}
          />
        </Row>
        <Row className="mb3">
          <Field
            name="password"
            type="password"
            placeholder="Password"
            data-test-id="password"
            component={renderFormInput}
          />
        </Row>
        <Button
          className="w-100"
          type="primary"
          htmlType="submit"
          data-test-id="login"
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
          <p>This login page is included only for dev and test environment</p>
          <Formik onSubmit={onLoginFormSubmit} initialValues={{}}>
            {renderLoginForm}
          </Formik>
        </Card>
      </Row>
    </>
  );
};

export default LocalLoginPage;
