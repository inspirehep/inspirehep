import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Map, List } from 'immutable';
import { Row, Col } from 'antd';
import { stringify } from 'qs';

import LoadingOrChildren from './LoadingOrChildren';
import AggregationFilters from './AggregationFilters';
import NumberOfResults from './NumberOfResults';
import SortBy from './SortBy';
import SearchResults from './SearchResults';
import SearchPagination from './SearchPagination';
import http from '../http';

class EmbeddedSearch extends Component {
  constructor(props) {
    super(props);

    this.onPageChange = this.onPageChange.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.onAggregationChange = this.onAggregationChange.bind(this);

    this.state = {
      query: {
        page: 1,
        size: 25,
        sort: 'mostrecent',
      },
      numberOfResults: 0,
      aggregations: Map(),
      results: List(),
      loadingResults: false,
      loadingAggregations: false,
    };
  }

  async onPageChange(page) {
    this.updateQueryStateAndSearch({ page });
  }

  async onSortChange(sort) {
    this.updateQueryStateAndSearch({ sort });
  }

  async onAggregationChange(aggregationKey, selections) {
    this.updateQueryStateAndSearch({ [aggregationKey]: selections });
  }

  // eslint-disable-next-line react/sort-comp
  async updateQueryStateAndSearch(partialQuery) {
    const query = {
      ...this.state.query,
      ...partialQuery,
    };
    await this.setState({ query });
    this.searchForCurrentQueryState();
  }

  searchForCurrentQueryState() {
    this.fetchSearchResults();
    this.fetchAggregations();
  }

  async fetchSearchResults() {
    const { pidType } = this.props;
    const queryString = stringify(this.getSearchQuery(), { indices: false });
    const searchUrl = `/${pidType}${queryString}`;
    this.setState({ loadingResults: true });
    const { data } = await http.get(searchUrl);
    this.setState({
      results: data.hits.hits,
      numberOfResults: data.hits.total,
      loadingResults: false,
    });
  }

  async fetchAggregations() {
    const { pidType, baseFacetsQuery } = this.props;
    const query = {
      ...baseFacetsQuery,
      ...this.getSearchQuery(),
    };
    const queryString = stringify(query, { indices: false });
    const searchUrl = `/${pidType}/facets${queryString}`;
    this.setState({ loadingAggregations: true });
    const {
      data: { aggregations },
    } = await http.get(searchUrl);
    this.setState({
      aggregations,
      loadingAggregations: false,
    });
  }

  getSearchQuery() {
    const { baseQuery } = this.props;
    const { query } = this.state;
    return {
      ...baseQuery,
      ...query,
    };
  }

  render() {
    const { renderResultItem } = this.props;
    const {
      query,
      aggregations,
      results,
      numberOfResults,
      loadingAggregations,
      loadingResults,
    } = this.state;
    return (
      <Row gutter={32} type="flex" justify="start">
        <Col lg={8} xl={6} xxl={5}>
          <LoadingOrChildren loading={loadingAggregations}>
            <AggregationFilters
              query={query}
              aggregations={aggregations}
              numberOfResults={numberOfResults}
              onAggregationChange={this.onAggregationChange}
            />
          </LoadingOrChildren>
        </Col>
        <Col lg={16} xl={15} xxl={14}>
          <LoadingOrChildren loading={loadingResults}>
            <Row type="flex" align="middle" justify="end">
              <Col span={12}>
                <NumberOfResults numberOfResults={numberOfResults} />
              </Col>
              <Col className="alignRight" span={12}>
                <SortBy onSortChange={this.onSortChange} sort={query.sort} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <SearchResults
                  renderItem={renderResultItem}
                  resutls={results}
                  onPageChange={this.onPageChange}
                />
                <SearchPagination
                  page={query.page}
                  pageSize={query.size}
                  total={numberOfResults}
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
  pidType: PropTypes.string.isRequired,
  baseQuery: PropTypes.objectOf(PropTypes.any),
  baseFacetsQuery: PropTypes.objectOf(PropTypes.any),
};

EmbeddedSearch.defaultProps = {
  baseQuery: {},
  baseFacetsQuery: {},
};

export default EmbeddedSearch;
