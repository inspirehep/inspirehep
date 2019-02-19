import React, { Component } from 'react';
import { Row, Col } from 'antd';

import SearchBoxContainer from '../common/containers/SearchBoxContainer';
import HowToSearch from './components/HowToSearch';
import './index.scss';

class Home extends Component {
  render() {
    return (
      <Row className="__Home__" type="flex" justify="center" align="middle">
        <Col span={18}>
          <Row>
            <Col>
              <h2 className="f2 tc">Discover High-Energy Physics content</h2>
              <h3 className="f3 tc mb5">
                INSPIRE beta provides a sneak preview of new features currently
                under development.
              </h3>
            </Col>
          </Row>
          <Row>
            <Col>
              <SearchBoxContainer />
            </Col>
          </Row>
          <Row className="mt4">
            <Col span={12} offset={6}>
              <HowToSearch />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default Home;
