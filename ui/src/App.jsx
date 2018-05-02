import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { Layout, Menu, Row, Col } from 'antd';

import './App.css';
import Holdingpen from './holdingpen';
import Literature from './literature';
import SearchBoxContainer from './common/containers/SearchBoxContainer';


class App extends Component {
  render() {
    return (
      <div>
        <Layout>
          <Layout.Header>
            <Row>
              <Col span={12}>
                <Menu
                  className="menu"
                  theme="dark"
                  mode="horizontal"
                >
                  <Menu.Item>
                    <Link to="/holdingpen/dashboard">Holdingpen</Link>
                  </Menu.Item>
                </Menu>
              </Col>
              <Col span={12}>
                <SearchBoxContainer />
              </Col>
            </Row>
          </Layout.Header>

          <Layout.Content>
            <Route path="/holdingpen" component={Holdingpen} />
            <Route path="/literature" component={Literature} />
          </Layout.Content>
        </Layout>
      </div>
    );
  }
}

export default App;
