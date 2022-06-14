import React, { Component } from 'react';
import { Row, Card, Button } from 'antd';

import orcidLogo from '../../../common/orcid.svg';
import './LoginPage.scss';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../../common/components/ExternalLink.tsx';
import DocumentHead from '../../../common/components/DocumentHead';
import { WHAT_IS_ORCID_URL } from '../../../common/constants';

const META_DESCRIPTION = 'Log in to your INSPIRE account. Log in with ORCID';
const TITLE = 'Login';

type Props = {
    previousUrl: string;
};

class LoginPage extends Component<Props> {

  render() {
    const { previousUrl } = this.props;
    const loginHref = `/api/accounts/login?next=${previousUrl}`;
    return (
      <>
        <DocumentHead title={TITLE} description={META_DESCRIPTION} />
        <Row
          className="__LoginPage__ h-100"
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          type="flex"
          justify="center"
          align="middle"
        >
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
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

export default LoginPage;
