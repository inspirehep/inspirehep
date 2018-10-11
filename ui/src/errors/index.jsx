import React, { Component } from 'react';
import { Row } from 'antd';
import { Route, Redirect, Switch } from 'react-router-dom';

import Error404 from './components/Error404';
import Error401 from './components/Error401';
import { ERROR_404, ERROR_401 } from '../common/routes';

class Errors extends Component {
  render() {
    return (
      <Row className="w-100 h-100" type="flex" justify="center" align="middle">
        <Switch>
          <Route exact path={ERROR_404} component={Error404} />
          <Route exact path={ERROR_401} component={Error401} />
          <Redirect to={ERROR_404} />
        </Switch>
      </Row>
    );
  }
}

export default Errors;
