import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List, fromJS } from 'immutable';
import { Row, Col } from 'antd';
import { stringify } from 'qs';

import LoadingOrChildren from './LoadingOrChildren';
import AggregationFilters from './AggregationFilters';
import NumberOfResults from './NumberOfResults';
import SortBy from './SortBy';
import SearchResults from './SearchResults';
import SearchPagination from './SearchPagination';
import http, { UI_SERIALIZER_REQUEST_OPTIONS } from '../http';
import { mergeWithConcattingArrays, shallowEqual } from '../utils';
import ResponsiveView from './ResponsiveView';
import DrawerHandle from './DrawerHandle';

class EmbeddedSearch extends Component {
  constructor(props) {
    super(props);

    this.onPageChange = this.onPageChange.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onAggregationChange = this.onAggregationChange.bind(this);

    this.state = {
      query: {
        page: 1,
        size: 10,
        sort: 'mostrecent',
      },
      numberOfResults: 0,
      aggregations: Map(),
      results: List(),
      loadingResults: false,
      loadingAggregations: false,
    };
  }

  componentDidMount() {
    this.searchForCurrentQueryState();
  }

  componentDidUpdate(prevProps) {
    const { pidType, baseQuery, baseFacetsQuery } = this.props;

    if (
      pidType !== prevProps.pidType ||
      !shallowEqual(baseQuery, prevProps.baseQuery) ||
      !shallowEqual(baseFacetsQuery, prevProps.baseFacetsQuery)
    ) {
      this.searchForCurrentQueryState();
    }
  }

  async onPageChange(page) {
    this.updateQueryStateAndSearch({ page });
  }

  async onSortChange(sort) {
    this.updateQueryStateAndSearch({ sort, page: 1 });
  }

  async onAggregationChange(aggregationKey, selections) {
    this.updateQueryStateAndSearch({ [aggregationKey]: selections, page: 1 });
  }

  // eslint-disable-next-line react/sort-comp
  async updateQueryStateAndSearch(partialQuery) {
    const { query } = this.state;
    const newQuery = {
      ...query,
      ...partialQuery,
    };
    await this.setState({ query: newQuery });
    this.searchForCurrentQueryState();
  }

  searchForCurrentQueryState() {
    this.fetchSearchResults();
    this.fetchAggregations();
  }

  async fetchSearchResults() {
    const { pidType } = this.props;
    const queryString = stringify(this.getSearchQuery(), { indices: false });
    const searchUrl = `/${pidType}?${queryString}`;
    this.setState({ loadingResults: true });
    try {
      const { data } = await http.get(searchUrl, UI_SERIALIZER_REQUEST_OPTIONS);
      this.setState({
        results: fromJS(data.hits.hits),
        numberOfResults: data.hits.total,
        loadingResults: false,
      });
    } catch (error) {
      this.setState({
        hasError: true,
        loadingResults: false,
      });
    }
  }

  async fetchAggregations() {
    const { pidType, baseFacetsQuery } = this.props;
    const query = {
      ...baseFacetsQuery,
      ...this.getSearchQuery(),
    };
    const queryString = stringify(query, { indices: false });
    const searchUrl = `/${pidType}/facets?${queryString}`;
    this.setState({ loadingAggregations: true });
    try {
      const { data } = await http.get(searchUrl);
      this.setState({
        aggregations: fromJS(data.aggregations),
        loadingAggregations: false,
      });
    } catch (error) {
      this.setState({
        hasError: true,
        loadingAggregations: false,
      });
    }
  }

  getSearchQuery() {
    const { baseQuery } = this.props;
    const { query } = this.state;
    return mergeWithConcattingArrays(baseQuery, query);
  }

  renderAggregations() {
    const {
      query,
      numberOfResults,
      loadingAggregations,
      aggregations,
    } = this.state;
    return (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFilters
          query={query}
          aggregations={aggregations}
          numberOfResults={numberOfResults}
          onAggregationChange={this.onAggregationChange}
        />
      </LoadingOrChildren>
    );
  }

  render() {
    const { renderResultItem, renderError } = this.props;
    const {
      query,
      results,
      numberOfResults,
      loadingResults,
      hasError,
    } = this.state;
    return hasError ? (
      renderError()
    ) : (
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
                <SortBy onSortChange={this.onSortChange} sort={query.sort} />
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
    );
  }
}

EmbeddedSearch.propTypes = {
  renderResultItem: PropTypes.func.isRequired,
  renderError: PropTypes.func,
  pidType: PropTypes.string.isRequired,
  baseQuery: PropTypes.objectOf(PropTypes.any),
  baseFacetsQuery: PropTypes.objectOf(PropTypes.any),
};

EmbeddedSearch.defaultProps = {
  baseQuery: {},
  baseFacetsQuery: {},
  renderError: () => null,
};

export default EmbeddedSearch;
