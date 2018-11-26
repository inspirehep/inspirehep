import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Card, Button } from 'antd';

import orcidLogo from './orcid.svg';
import './LoginPage.scss';
import { userLogin } from '../../../actions/user';

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
          <p className="f4">Please sign in to suggest content to INSPIRE</p>
          <Button className="login-button h3" onClick={onLoginClick}>
            <img className="logo mr2" src={orcidLogo} alt="ORCID" />
            <strong>Login with ORCID</strong>
          </Button>
          <a
            className="db pt3"
            href="https://labs.inspirehep.net/help/knowledge-base/what-is-orcid/"
            target="_blank"
            rel="noreferrer noopener"
          >
            What is ORCID?
          </a>
        </Card>
      </Row>
    );
  }
}

LoginPage.propTypes = {
  onLoginClick: PropTypes.func.isRequired,
};

export const dispatchToProps = dispatch => ({
  onLoginClick() {
    dispatch(userLogin());
  },
});

export default connect(null, dispatchToProps)(LoginPage);
