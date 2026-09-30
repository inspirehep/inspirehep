import { Component } from 'react';
import { Row, Col, Spin } from 'antd';

class Loading extends Component {
  render() {
    return (
      <Row className="w-100" type="flex" justify="center" align="middle">
        <Col>
          <div data-testid="loading-spinner" className="tc pa4">
            <Spin description="Loading ...">
              <div className="pa4" />
            </Spin>
          </div>
        </Col>
      </Row>
    );
  }
}

export default Loading;
