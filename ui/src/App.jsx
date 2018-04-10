import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';

import './App.css';
import Holdingpen from './holdingpen';


class App extends Component {
  render() {
    return (
      <div>
        <Layout>
          <Layout.Header>
            <Menu
              className="menu"
              theme="dark"
              mode="horizontal"
            >
              <Menu.Item>
                <Link to="/holdingpen">Holdingpen</Link>
              </Menu.Item>
            </Menu>
          </Layout.Header>

          <Layout.Content>
            <Route exact path="/holdingpen" component={Holdingpen} />
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default App;
