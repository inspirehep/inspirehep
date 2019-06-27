import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Card, Button, Input } from 'antd';
import { Field, Form, Formik } from 'formik';

class LocalLoginPage extends Component {
  static renderFormInput({ field, form, ...props }) {
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
      <Row className="h-100" type="flex" justify="center" align="middle">
        <Card align="middle">
          <p>This login page is included only for dev and test environment</p>
          <Formik
            onSubmit={onLoginFormSubmit}
            render={LocalLoginPage.renderLoginForm}
          />
        </Card>
      </Row>
    );
  }
}

LocalLoginPage.propTypes = {
  onLoginFormSubmit: PropTypes.func.isRequired,
};

export default LocalLoginPage;
