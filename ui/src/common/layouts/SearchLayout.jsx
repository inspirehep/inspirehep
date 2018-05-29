import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

import AggregationFiltersContainer from './../containers/AggregationFiltersContainer';
import PaginationContainer from './../containers/PaginationContainer';
import SortByContainer from './../containers/SortByContainer';
import ResultsContainer from './../containers/ResultsContainer';

class SearchLayout extends Component {
  render() {
    return (
      <Row type="flex" justify="space-between">
        <Col span={6}>
          <AggregationFiltersContainer />
        </Col>
        <Col span={18}>
          <PaginationContainer />
          <SortByContainer />
          <ResultsContainer renderItem={this.props.renderResultItem} />
        </Col>
      </Row>
    );
  }
}

SearchLayout.propTypes = {
  renderResultItem: PropTypes.func.isRequired,
};

export default SearchLayout;
