import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import SearchPage from './containers/SearchPage';

class Literature extends Component {
  render() {
    return (
      <div>
        <Route path="/literature" component={SearchPage} />
      </div>
    );
  }
}

export default Literature;
