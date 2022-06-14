import React from 'react';
import { Row, Col, Card, Alert } from 'antd';

import SingUpForm from './SingUpForm';
import DocumentHead from '../../common/components/DocumentHead';

type Props = {
    onSubmit: $TSFixMeFunction;
    loading: boolean;
    error?: {
        [key: string]: $TSFixMe;
    };
};

function SignUpPage({ onSubmit, loading, error }: Props) {
  return (
    <>
      <DocumentHead title="Sign up" />
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Row className="h-100" type="flex" justify="center" align="middle">
        <Card>
          <p>
          Please let us know your e-mail address to complete your account registration.
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
