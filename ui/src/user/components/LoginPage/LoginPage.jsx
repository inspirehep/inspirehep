import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { Row, Card, Button } from 'antd';

import orcidLogo from '../../../common/orcid.svg';
import './LoginPage.scss';
import ExternalLink from '../../../common/components/ExternalLink.tsx';
import DocumentHead from '../../../common/components/DocumentHead';
import { WHAT_IS_ORCID_URL } from '../../../common/constants';

const META_DESCRIPTION = 'Log in to your INSPIRE account. Log in with ORCID';
const TITLE = 'Login';

class LoginPage extends Component {
  render() {
    const { previousUrl } = this.props;
    const loginHref = `/api/accounts/login?next=${previousUrl}`;
    return (
      <>
        <DocumentHead title={TITLE} description={META_DESCRIPTION} />
        <Row
          className="__LoginPage__ h-100"
          type="flex"
          justify="center"
          align="middle"
        >
          <Card align="middle">
            <p className="f4">Please sign in to INSPIRE</p>
            <p className="pb2">
              To suggest content to INSPIRE, an ORCID is required. Registration
              is free, quick, and open to all! Sign up at{' '}
              <ExternalLink href="https://orcid.org/register!">
                https://orcid.org/register
              </ExternalLink>
            </p>
            <Button className="login-button h3" href={loginHref}>
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
  }
}

LoginPage.propTypes = {
  previousUrl: PropTypes.string.isRequired,
};

export default LoginPage;
