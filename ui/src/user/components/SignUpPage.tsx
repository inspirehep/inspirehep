import React from 'react';
import { Row, Col, Card, Alert } from 'antd';

import SingUpForm from './SingUpForm';
import DocumentHead from '../../common/components/DocumentHead';
import { FormikHelpers } from 'formik';

function SignUpPage({
  onSubmit,
  loading,
  error,
}: {
  onSubmit: ((
    values: {},
    formikHelpers: FormikHelpers<{}>
  ) => void | Promise<any>) &
    Function;
  loading: boolean;
  error: Error;
}) {
  return (
    <>
      <DocumentHead title="Sign up" />
      <Row className="h-100" justify="center" align="middle">
        <Card>
          <p>
            Please let us know your e-mail address to complete your account
            registration.
          </p>
          {error && (
            <Row className="mb3">
              <Col>
                <Alert message={error.message} type="error" showIcon closable />
              </Col>
            </Row>
          )}
          <SingUpForm onSubmit={onSubmit} loading={loading} />
        </Card>
      </Row>
    </>
  );
}

export default SignUpPage;
