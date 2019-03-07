import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import AggregationFiltersContainer from '../../containers/AggregationFiltersContainer';
import PaginationContainer from '../../containers/PaginationContainer';
import SortByContainer from '../../containers/SortByContainer';
import ResultsContainer from '../../containers/ResultsContainer';
import NumberOfResultsContainer from '../../containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../components/LoadingOrChildren';
import './SearchLayout.scss';
import ResponsiveView from '../../components/ResponsiveView';
import DrawerHandle from '../../components/DrawerHandle';

class SearchLayout extends Component {
  renderAggregations() {
    const { loadingAggregations } = this.props;
    return (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer />
      </LoadingOrChildren>
    );
  }

  render() {
    const {
      renderResultItem,
      loading,
      withoutSort,
      withoutAggregations,
    } = this.props;
    return (
      <Row
        className="__SearchLayout__"
        gutter={{ xs: 0, sm: 16, md: 32 }}
        type="flex"
        justify="start"
      >
        <Col xs={24} lg={8} xl={6} xxl={5}>
          {!withoutAggregations && (
            <>
              <ResponsiveView
                min="lg"
                render={() => this.renderAggregations()}
              />
              <ResponsiveView
                max="md"
                render={() => (
                  <DrawerHandle handleText="Filter" drawerTitle="Filter">
                    {this.renderAggregations()}
                  </DrawerHandle>
                )}
              />
            </>
          )}
        </Col>
        <Col xs={24} lg={16} xl={15} xxl={14}>
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
