import React, { Component } from 'react';
import { Row, Col } from 'antd';

import './index.scss';
import SearchBoxContainer from '../common/containers/SearchBoxContainer';

class Home extends Component {
  render() {
    return (
      <div className="__Home__">
        <div>
          <Row>
            <Col span={10} offset={4}>
              <h3>Discover High-Energy Phytsics content</h3>
            </Col>
          </Row>
          <Row>
            <Col span={10} offset={4}>
              <div className="large-searchbox">
                <SearchBoxContainer />
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={10} offset={4}>
              Query Examples
            </Col>
          </Row>
          <Row>
            <Col span={22} offset={1}>
              INSPIRE Labs provides a sneak preview of new features and designs
              currently under development.
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

export default Home;
