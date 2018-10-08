import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import AggregationFiltersContainer from './../../containers/AggregationFiltersContainer/AggregationFiltersContainer';
import PaginationContainer from './../../containers/PaginationContainer';
import SortByContainer from './../../containers/SortByContainer';
import ResultsContainer from './../../containers/ResultsContainer';
import NumberOfResultsContainer from '../../containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../components/LoadingOrChildren';
import './SearchLayout.scss';

class SearchLayout extends Component {
  render() {
    const {
      renderResultItem,
      loading,
      loadingAggregations,
      withoutAggregations,
      withoutSort,
    } = this.props;
    return (
      <Row className="__SearchLayout__" gutter={32} type="flex" justify="start">
        <Col lg={8} xl={6} xxl={5}>
          {!withoutAggregations && (
            <LoadingOrChildren loading={loadingAggregations}>
              <AggregationFiltersContainer />
            </LoadingOrChildren>
          )}
        </Col>
        <Col lg={16} xl={15} xxl={14}>
          <LoadingOrChildren loading={loading}>
            <Row type="flex" align="middle" justify="end">
              <Col span={12}>
                <NumberOfResultsContainer />
              </Col>
              <Col className="alignRight" span={12}>
                {!withoutSort && <SortByContainer />}
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer renderItem={renderResultItem} />
                <PaginationContainer />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    );
  }
}

SearchLayout.propTypes = {
  renderResultItem: PropTypes.func.isRequired,
  withoutAggregations: PropTypes.bool,
  withoutSort: PropTypes.bool,
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
};

SearchLayout.defaultProps = {
  withoutAggregations: false,
  withoutSort: false,
};

const stateToProps = state => ({
  loading: state.search.get('loading'),
  loadingAggregations: state.search.get('loadingAggregations'),
});

export default connect(stateToProps)(SearchLayout);
