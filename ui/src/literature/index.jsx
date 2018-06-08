import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import SearchPage from './containers/SearchPage';
import DetailPage from './containers/DetailPage';

import './index.scss';

class Literature extends Component {
  render() {
    return (
      <div className="__Literature__">
        <Route exact path="/literature" component={SearchPage} />
        <Route exact path="/literature/:id" component={DetailPage} />
      </div>
    );
  }
}

export default Literature;
