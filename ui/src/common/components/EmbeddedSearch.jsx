import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Row, Col } from 'antd';

import LoadingOrChildren from './LoadingOrChildren';
import AggregationFilters from './AggregationFilters';
import NumberOfResults from './NumberOfResults';
import SortBy from './SortBy';
import SearchResults from './SearchResults';
import SearchPagination from './SearchPagination';
import ResponsiveView from './ResponsiveView';
import DrawerHandle from './DrawerHandle';
import { SelectOptionsPropType } from '../propTypes';
import VerticalDivider from '../VerticalDivider';
import { SUPERUSER } from '../authorization';
import AuthorizedContainer from '../containers/AuthorizedContainer';
import CiteAllAction from '../../literature/components/CiteAllAction';

class EmbeddedSearch extends Component {
  constructor(props) {
    super(props);

    this.onPageChange = this.onPageChange.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onAggregationChange = this.onAggregationChange.bind(this);
  }

  async onPageChange(page) {
    this.onQueryChange({ page });
  }

  async onSortChange(sort) {
    this.onQueryChange({ sort, page: 1 });
  }

  async onAggregationChange(aggregationKey, selections) {
    this.onQueryChange({ [aggregationKey]: selections, page: 1 });
  }

  onQueryChange(query) {
    const { onQueryChange } = this.props;
    if (onQueryChange) {
      onQueryChange(query);
    }
  }

  renderAggregations() {
    const {
      query,
      numberOfResults,
      loadingAggregations,
      aggregations,
      initialAggregations,
    } = this.props;
    return (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFilters
          query={query}
          aggregations={aggregations}
          initialAggregations={initialAggregations}
          numberOfResults={numberOfResults}
          onAggregationChange={this.onAggregationChange}
        />
      </LoadingOrChildren>
    );
  }

  render() {
    const {
      renderResultItem,
      query,
      results,
      error,
      numberOfResults,
      loadingResults,
      sortOptions,
    } = this.props;
    return (
      !error && (
        <Row gutter={{ xs: 0, lg: 32 }} type="flex" justify="start">
          <ResponsiveView
            min="lg"
            render={() => (
              <Col xs={0} lg={7}>
                {this.renderAggregations()}
              </Col>
            )}
          />
          <Col xs={24} lg={17}>
            <LoadingOrChildren loading={loadingResults}>
              <Row type="flex" align="middle" justify="space-between">
                <Col xs={24} lg={12}>
                  <NumberOfResults numberOfResults={numberOfResults} />
                  <AuthorizedContainer authorizedRoles={SUPERUSER}>
                    <VerticalDivider />
                    <CiteAllAction
                      query={query}
                      numberOfResults={numberOfResults}
                    />
                  </AuthorizedContainer>
                </Col>
                <ResponsiveView
                  max="md"
                  render={() => (
                    <Col xs={24} md={12}>
                      <DrawerHandle
                        className="mv2"
                        handleText="Filter"
                        drawerTitle="Filter"
                      >
                        {this.renderAggregations()}
                      </DrawerHandle>
                    </Col>
                  )}
                />
                <Col>
                  <SortBy
                    onSortChange={this.onSortChange}
                    sort={query.sort}
                    sortOptions={sortOptions}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <SearchResults
                    renderItem={renderResultItem}
                    page={query.page}
                    pageSize={query.size}
                    results={results}
                  />
                  <SearchPagination
                    page={query.page}
                    pageSize={query.size}
                    total={numberOfResults}
                    onPageChange={this.onPageChange}
                  />
                </Col>
              </Row>
            </LoadingOrChildren>
          </Col>
        </Row>
      )
    );
  }
}

EmbeddedSearch.propTypes = {
  renderResultItem: PropTypes.func.isRequired,
  query: PropTypes.objectOf(PropTypes.any).isRequired, // requires size and page
  onQueryChange: PropTypes.func,
  results: PropTypes.instanceOf(List),
  aggregations: PropTypes.instanceOf(Map),
  initialAggregations: PropTypes.instanceOf(Map),
  sortOptions: SelectOptionsPropType,
  numberOfResults: PropTypes.number,
  loadingResults: PropTypes.bool,
  loadingAggregations: PropTypes.bool,
  error: PropTypes.instanceOf(Map),
};

EmbeddedSearch.defaultProps = {
  error: null,
  onQueryChange: null,
  sortOptions: null,
  results: List(),
  aggregations: Map(),
  initialAggregations: Map(),
  numberOfResults: 0,
  loadingResults: false,
  loadingAggregations: false,
};

export default EmbeddedSearch;
