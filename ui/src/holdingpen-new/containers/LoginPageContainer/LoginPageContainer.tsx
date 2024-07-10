import React from 'react';
import { Row, Card, Button, Input } from 'antd';
import { Field, Form, Formik } from 'formik';
import axios from 'axios';

import DocumentHead from '../../../common/components/DocumentHead';
import {
  BACKOFFICE_LOGIN,
  HOLDINGPEN_DASHBOARD_NEW,
} from '../../../common/routes';
import storage from '../../../common/storage';

const LocalLoginPage = () => {
  const onLoginFormSubmit = async (creds: {
    username: string | null;
    password: string | null;
  }) => {
    const response = await axios.post(
      BACKOFFICE_LOGIN,
      {
        email: creds.username,
        password: creds.password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200) {
      const { access, refresh } = await response.data;
      storage.set('holdingpen.token', access);
      storage.set('holdingpen.refreshToken', refresh);

      window.location.assign(HOLDINGPEN_DASHBOARD_NEW);
    }
  };

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

  function renderLoginForm() {
    return (
      <Form>
        <Row className="mb3">
          <Field
            name="username"
            type="username"
            placeholder="Username"
            data-test-id="username"
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
          <h1 className="b mb4 f5">
            Please log in with your Backoffice account
          </h1>
          <Formik
            onSubmit={(creds: {
              username: string | null;
              password: string | null;
            }) => onLoginFormSubmit(creds)}
            initialValues={{ username: null, password: null }}
          >
            {renderLoginForm}
          </Formik>
        </Card>
      </Row>
    </>
  );
};

export default LocalLoginPage;
