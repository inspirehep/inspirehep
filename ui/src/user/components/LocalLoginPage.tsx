import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Card, Button, Input } from 'antd';
import { Field, Form, Formik } from 'formik';
import DocumentHead from '../../common/components/DocumentHead';

class LocalLoginPage extends Component {
  static renderFormInput({
    field,
    form,
    ...props
  }: any) {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'onLoginFormSubmit' does not exist on typ... Remove this comment to see the full error message
    const { onLoginFormSubmit } = this.props;
    return (
      <>
        {/* @ts-ignore */}
        <DocumentHead title="Login" />
        {/* @ts-ignore */}
        <Row className="h-100" justify="center" align="middle">
          {/* @ts-ignore */}
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
LocalLoginPage.propTypes = {
  onLoginFormSubmit: PropTypes.func.isRequired,
};

export default LocalLoginPage;
