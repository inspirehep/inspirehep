import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

import AggregationFiltersContainer from './containers/AggregationFiltersContainer';
import PaginationContainer from './containers/PaginationContainer';
import SortByContainer from './containers/SortByContainer';
import ResultsContainer from './containers/ResultsContainer';

class SearchLayout extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col span={6}>
            <AggregationFiltersContainer />
          </Col>
          <Col span={18}>
            <Row>
              <Col span={12}>
                <PaginationContainer />
              </Col>
              <Col span={12}>
                <SortByContainer />
              </Col>
            </Row>
            <Row>
              <ResultsContainer
                renderItem={this.props.renderResultItem}
              />
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

SearchLayout.propTypes = {
  renderResultItem: PropTypes.func.isRequired,
};

export default SearchLayout;
