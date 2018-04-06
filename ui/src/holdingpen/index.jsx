import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Dashboard from './containers/Dashboard';

class Holdingpen extends Component {
  render() {
    return (
      <div>
        <Route exact path="/holdingpen" component={Dashboard} />
      </div>
    );
  }
}

export default Holdingpen;
