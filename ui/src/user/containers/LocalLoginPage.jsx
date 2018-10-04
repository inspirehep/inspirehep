import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Card, Button } from 'antd';

import { userLoginSuccess } from '../../actions/user';

class LocalLoginPage extends Component {
  constructor(props) {
    super(props);
    this.onLoginClick = this.onLoginClick.bind(this);
  }

  async onLoginClick() {
    this.props.dispatch(
      userLoginSuccess({
        data: {
          email: 'admin@inspirehep.net',
          roles: ['superuser'],
        },
      })
    );
  }

  render() {
    return (
      <Row className="h-100" type="flex" justify="center" align="middle">
        <Card align="middle">
          <p>
            This login page is included only dev environment and Login button
            dispatches login success action with admin account
          </p>
          <p>
            Please not that this does not allow accessing protected API routes
            but only private client side routes
          </p>
          <Button
            className="h3"
            data-test-id="login"
            onClick={this.onLoginClick}
          >
            <strong>Login</strong>
          </Button>
        </Card>
      </Row>
    );
  }
}

LocalLoginPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const dispatchToProps = dispatch => ({ dispatch });

export default connect(null, dispatchToProps)(LocalLoginPage);
