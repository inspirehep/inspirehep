import React from 'react';
import { Row, Col, Card, Alert } from 'antd';
import { FormikHelpers } from 'formik';

import SingUpForm from './SingUpForm';
import DocumentHead from '../../common/components/DocumentHead';

const SignUpPage: React.FC<{
  onSignUp: ((
    values: {},
    formikHelpers: FormikHelpers<{}>
  ) => void | Promise<any>) &
    Function;
  loading: boolean;
  error?: { message: string };
}> = ({ onSignUp, loading, error }) => {
  return (
    <>
      <DocumentHead title="Sign up" />
      <Row
        className="h-100"
        justify="center"
        align="middle"
        data-testid="sign-up"
      >
        <Card>
          <p>
            Please let us know your e-mail address to complete your account
            registration.
          </p>
          {error && (
            <Row className="mb3" data-testid={error.message}>
              <Col>
                <Alert message={error.message} type="error" showIcon closable />
              </Col>
            </Row>
          )}
          <div data-testid={loading}>
            <SingUpForm onSignUp={onSignUp} loading={loading} />
          </div>
        </Card>
      </Row>
    </>
  );
};

export default SignUpPage;
