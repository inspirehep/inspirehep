import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import { Layout } from 'antd';
import Loadable from 'react-loadable';

import './App.scss';
import Header from './common/layouts/Header';
import Footer from './common/layouts/Footer';
import Loading from './common/components/Loading';

const Holdingpen$ = Loadable({
  loader: () => import('./holdingpen'),
  loading: Loading,
});
const Literature$ = Loadable({
  loader: () => import('./literature'),
  loading: Loading,
});
const Home$ = Loadable({
  loader: () => import('./home'),
  loading: Loading,
});
const User$ = Loadable({
  loader: () => import('./user'),
  loading: Loading,
});

class App extends Component {
  componentDidMount() {
    Loadable.preloadAll();
  }

  render() {
    return (
      <Layout className="__App__">
        <Header />
        <Layout.Content className="content">
          <Switch id="main">
            <Route exact path="/" component={Home$} />
            <Route path="/user" component={User$} />
            <Route path="/holdingpen" component={Holdingpen$} />
            <Route path="/literature" component={Literature$} />
          </Switch>
        </Layout.Content>
        <Footer />
      </Layout>
    );
  }
}

export default App;
