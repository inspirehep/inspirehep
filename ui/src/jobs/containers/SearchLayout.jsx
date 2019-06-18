import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
import DrawerHandle from '../../common/components/DrawerHandle';
import JobItem from '../components/JobItem';

class SearchLayout extends Component {
  static renderJobResultItem(result) {
    return (
      <JobItem
        metadata={result.get('metadata')}
        created={result.get('created')}
      />
    );
  }

  constructor(props) {
    super(props);
    this.renderAggregationsDrawer = this.renderAggregationsDrawer.bind(this);
    this.renderAggregations = this.renderAggregations.bind(this);
  }

  renderAggregations() {
    const { loadingAggregations } = this.props;
    return (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer inline displayWhenNoResults />
      </LoadingOrChildren>
    );
  }

  renderAggregationsDrawer() {
    const { loadingAggregations } = this.props;
    return (
      <DrawerHandle className="mt2" handleText="Filter" drawerTitle="Filter">
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer inline displayWhenNoResults />
        </LoadingOrChildren>
      </DrawerHandle>
    );
  }

  render() {
    const { loading } = this.props;
    return (
      <div>
        <Row className="bg-white mb3" type="flex" justify="center">
          <Col xs={0} lg={16} xl={16} xxl={14}>
            <ResponsiveView min="lg" render={this.renderAggregations} />
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col xs={24} lg={16} xl={16} xxl={14}>
            <LoadingOrChildren loading={loading}>
              <Row type="flex" align="middle" justify="end">
                <Col xs={24} lg={12}>
                  <NumberOfResultsContainer />
                </Col>
                <Col xs={12} lg={0}>
                  <ResponsiveView
                    max="md"
                    render={this.renderAggregationsDrawer}
                  />
                </Col>
                <Col className="tr" span={12}>
                  <SortByContainer />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <ResultsContainer
                    renderItem={SearchLayout.renderJobResultItem}
                  />
                  <PaginationContainer />
                </Col>
              </Row>
            </LoadingOrChildren>
          </Col>
        </Row>
      </div>
    );
  }
}

SearchLayout.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loading: state.search.get('loading'),
  loadingAggregations: state.search.get('loadingAggregations'),
});

export default connect(stateToProps)(SearchLayout);
