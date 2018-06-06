import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Layout } from 'antd';

import './App.scss';
import Header from './common/layouts/Header';
import Holdingpen from './holdingpen';
import Literature from './literature';
import Home from './home';

class App extends Component {
  render() {
    return (
      <Layout className="__App__">
        <Header />
        <Layout.Content className="content">
          <Switch id="main">
            <Route exact path="/" component={Home} />
            <Route path="/holdingpen" component={Holdingpen} />
            <Route path="/literature" component={Literature} />
          </Switch>
        </Layout.Content>
      </Layout>
    );
  }
}

export default App;
