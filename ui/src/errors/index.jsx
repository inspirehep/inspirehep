import React, { Component } from 'react';
import { Row } from 'antd';
import { Route, Redirect, Switch } from 'react-router-dom';

import {
  ERROR_404,
  ERROR_401,
  ERROR_500,
  ERROR_NETWORK,
} from '../common/routes';
import Error404 from './components/Error404';
import Error401 from './components/Error401';
import Error500 from './components/Error500';
import ErrorNetwork from './components/ErrorNetwork';

class Errors extends Component {
  render() {
    return (
      <Row className="w-100 h-100" type="flex" justify="center" align="middle">
        <Switch>
          <Route exact path={ERROR_404} component={Error404} />
          <Route exact path={ERROR_401} component={Error401} />
          <Route exact path={ERROR_500} component={Error500} />
          <Route exact path={ERROR_NETWORK} component={ErrorNetwork} />
          <Redirect to={ERROR_404} />
        </Switch>
      </Row>
    );
  }
}

export default Errors;
