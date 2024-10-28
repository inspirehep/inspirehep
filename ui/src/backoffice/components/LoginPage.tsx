import React from 'react';
import { Row, Card } from 'antd';

import orcidLogo from '../../common/assets/orcid.svg';
import DocumentHead from '../../common/components/DocumentHead';
import ExternalLink from '../../common/components/ExternalLink';
import { WHAT_IS_ORCID_URL } from '../../common/constants';
import { BACKOFFICE_LOGIN_ORCID } from '../../common/routes';

const LoginPage: React.FC = () => {
  return (
    <>
      <DocumentHead title="Login" />
      <Row
        className="__LoginPage__ h-100"
        justify="center"
        align="middle"
        data-testid="login-page"
      >
        <Card bodyStyle={{ textAlign: 'center' }}>
          <p className="f4">Please log in to BACKOFFICE</p>
          <p className="pb2">
            To login to Backoffice, an ORCID is required. Registration is free,
            quick, and open to all! Sign up at{' '}
            <ExternalLink href="https://orcid.org/register!">
              https://orcid.org/register
            </ExternalLink>
          </p>
          <form action={BACKOFFICE_LOGIN_ORCID} method="post">
            <button
              type="submit"
              className="login-button bg-white ba ant-btn"
              data-testid="login-button"
            >
              <img className="logo mr2" src={orcidLogo} alt="ORCID" />
              <strong>Login with ORCID</strong>
            </button>
          </form>
          <ExternalLink href={WHAT_IS_ORCID_URL} className="db pt3">
            What is ORCID?
          </ExternalLink>
        </Card>
      </Row>
    </>
  );
};

export default LoginPage;
