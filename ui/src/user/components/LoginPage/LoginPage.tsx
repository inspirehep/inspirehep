import React from 'react';
import { Row, Card, Button } from 'antd';

import './LoginPage.less';
import orcidLogo from '../../../common/assets/orcid.svg';
import ExternalLink from '../../../common/components/ExternalLink';
import DocumentHead from '../../../common/components/DocumentHead';
import { WHAT_IS_ORCID_URL } from '../../../common/constants';

const META_DESCRIPTION = 'Log in to your INSPIRE account. Log in with ORCID';
const TITLE = 'Login';

const LoginPage = ({ previousUrl }: { previousUrl: string }) => {
  const loginHref = `/api/accounts/login?next=${previousUrl}`;
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row className="__LoginPage__ h-100" justify="center" align="middle" data-testid="login-page">
        <Card bodyStyle={{ textAlign: 'center' }}>
          <p className="f4">Please sign in to INSPIRE</p>
          <p className="pb2">
            To suggest content to INSPIRE, an ORCID is required. Registration is
            free, quick, and open to all! Sign up at{' '}
            <ExternalLink href="https://orcid.org/register!">
              https://orcid.org/register
            </ExternalLink>
          </p>
          <Button className="login-button" href={loginHref} data-testid="login-button">
            <img className="logo mr2" src={orcidLogo} alt="ORCID" />
            <strong>Login with ORCID</strong>
          </Button>
          <ExternalLink href={WHAT_IS_ORCID_URL} className="db pt3">
            What is ORCID?
          </ExternalLink>
        </Card>
      </Row>
    </>
  );
};

export default LoginPage;
