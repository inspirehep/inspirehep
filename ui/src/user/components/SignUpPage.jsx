import React from 'react';
import { Row, Col, Card, Alert } from 'antd';
import PropTypes from 'prop-types';

import SingUpForm from './SingUpForm';
import DocumentHead from '../../common/components/DocumentHead';

function SignUpPage({ onSubmit, loading, error }) {
  return (
    <>
      <DocumentHead title="Sign up" />
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

SignUpPage.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.objectOf(PropTypes.any),
};

export default SignUpPage;
