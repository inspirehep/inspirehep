import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Row, Col } from 'antd';

import Header from './common/partials/Header';

import './App.scss';
import Holdingpen from './holdingpen';
import Literature from './literature';

class App extends Component {
  render() {
    return (
      <Row className="__App__" type="flex">
        <Col span={24}>
          <Header />
        </Col>
        <Col className={'mainContent'} span={24}>
          <Switch id="main">
            <Route path="/holdingpen" component={Holdingpen} />
            <Route path="/literature" component={Literature} />
          </Switch>
        </Col>
      </Row>
    );
  }
}

export default App;
