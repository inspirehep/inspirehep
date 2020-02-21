import React, { Component } from 'react';
import { Row, Col } from 'antd';

import SearchBoxContainer from '../common/containers/SearchBoxContainer';
import HowToSearch from './components/HowToSearch';
import './index.scss';
import DocumentHead from '../common/components/DocumentHead';

const META_DESCRIPTION = "INSPIRE is the leading information platform for High Energy Physics (HEP) literature which provides users with high quality, curated content covering the entire corpus of HEP literature, authors, data, jobs, conferences, institutions and experiments."
const TITLE = "Home"

class Home extends Component {
  render() {
    return (
      <>
        <DocumentHead title={TITLE} description={META_DESCRIPTION} />
        <Row className="__Home__" type="flex" justify="center" align="middle">
          <Col xs={24} sm={18}>
            <Row className="pt4">
              <Col>
                <h2 className="f2 tc sm-f4">
                  Discover High-Energy Physics content
                </h2>
                <h3 className="f3 tc mb5 sm-f5">
                  INSPIRE beta provides a sneak preview of new features
                  currently under development.
                </h3>
              </Col>
            </Row>
            <Row>
              <Col>
                <SearchBoxContainer />
              </Col>
            </Row>
            <Row className="mt4" type="flex" justify="center">
              <Col xs={24} sm={18} md={14} lg={12}>
                <HowToSearch />
              </Col>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

export default Home;
