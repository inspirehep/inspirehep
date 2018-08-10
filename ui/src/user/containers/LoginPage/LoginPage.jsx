import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Card, Button } from 'antd';

import orcidLogo from './orcid.svg';
import './LoginPage.scss';
import { userLogin } from '../../../actions/user';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.onLoginClick = this.onLoginClick.bind(this);
  }
  async onLoginClick() {
    this.props.dispatch(userLogin());
  }

  render() {
    return (
      <Row
        className="__LoginPage__ h-100"
        type="flex"
        justify="center"
        align="middle"
      >
        <Card align="middle">
          <p className="f4">Please sign in to suggest content to INSPIRE</p>
          <Button className="login-button h3" onClick={this.onLoginClick}>
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
  dispatch: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => ({ dispatch });

export default connect(null, dispatchToProps)(LoginPage);
