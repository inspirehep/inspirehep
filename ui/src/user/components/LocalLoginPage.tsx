import React, { Component } from 'react';
import { Row, Card, Button, Input } from 'antd';
import { Field, Form, Formik } from 'formik';
import DocumentHead from '../../common/components/DocumentHead';

type Props = {
    onLoginFormSubmit: $TSFixMeFunction;
};

class LocalLoginPage extends Component<Props> {

  static renderFormInput({
    field,
    form,
    ...props
  }: $TSFixMe) {
    return <Input {...field} {...props} />;
  }

  static renderLoginForm() {
    return (
      <Form>
        <Row className="mb3">
          <Field
            name="email"
            type="email"
            placeholder="Email"
            data-test-id="email"
            component={LocalLoginPage.renderFormInput}
          />
        </Row>
        <Row className="mb3">
          <Field
            name="password"
            type="password"
            placeholder="Password"
            data-test-id="password"
            component={LocalLoginPage.renderFormInput}
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

  render() {
    const { onLoginFormSubmit } = this.props;
    return (
      <>
        <DocumentHead title="Login" />
        {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
        <Row className="h-100" type="flex" justify="center" align="middle">
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <Card align="middle">
            <p>This login page is included only for dev and test environment</p>
            <Formik onSubmit={onLoginFormSubmit} initialValues={{}}>
              {LocalLoginPage.renderLoginForm}
            </Formik>
          </Card>
        </Row>
      </>
    );
  }
}

export default LocalLoginPage;
