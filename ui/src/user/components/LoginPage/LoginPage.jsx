import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { Row, Card, Button } from 'antd';

import orcidLogo from '../../../common/orcid.svg';
import './LoginPage.scss';
import ExternalLink from '../../../common/components/ExternalLink';

class LoginPage extends Component {
  render() {
    const { onLoginClick } = this.props;
    return (
      <Row
        className="__LoginPage__ h-100"
        type="flex"
        justify="center"
        align="middle"
      >
        <Card align="middle">
          <p className="f4">Please sign in to INSPIRE</p>
          <p className="pb2">
            To suggest content to INSPIRE, an ORCID is required. Registration is
            free, quick, and open to all! Sign up at{' '}
            <ExternalLink href="https://orcid.org/register!">
              https://orcid.org/register
            </ExternalLink>
          </p>
          <Button className="login-button h3" onClick={onLoginClick}>
            <img className="logo mr2" src={orcidLogo} alt="ORCID" />
            <strong>Login with ORCID</strong>
          </Button>
          <ExternalLink
            href="https://labs.inspirehep.net/help/knowledge-base/what-is-orcid/"
            className="db pt3"
          >
            What is ORCID?
          </ExternalLink>
        </Card>
      </Row>
    );
  }
}

LoginPage.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
};

export default LoginPage;
