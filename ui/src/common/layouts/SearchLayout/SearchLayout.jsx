import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';

import AggregationFiltersContainer from './../../containers/AggregationFiltersContainer/AggregationFiltersContainer';
import PaginationContainer from './../../containers/PaginationContainer';
import SortByContainer from './../../containers/SortByContainer';
import ResultsContainer from './../../containers/ResultsContainer';
import NumberOfResultsContainer from '../../containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../components/LoadingOrChildren';
import './SearchLayout.scss';

class SearchLayout extends Component {
  render() {
    return (
      <LoadingOrChildren loading={this.props.loading}>
        <Row
          className="__SearchLayout__"
          gutter={32}
          type="flex"
          justify="start"
        >
          <Col span={5}>
            <AggregationFiltersContainer />
          </Col>
          <Col span={14}>
            <Row type="flex" align="middle" justify="end">
              <Col span={12}>
                <NumberOfResultsContainer />
              </Col>
              <Col className="alignRight" span={12}>
                <SortByContainer />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer renderItem={this.props.renderResultItem} />
                <PaginationContainer />
              </Col>
            </Row>
          </Col>
        </Row>
      </LoadingOrChildren>
    );
  }
}

SearchLayout.propTypes = {
  renderResultItem: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default SearchLayout;
