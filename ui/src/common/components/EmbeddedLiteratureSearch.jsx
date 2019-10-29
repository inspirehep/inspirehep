import React, { useCallback, useEffect } from 'react';
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
import LiteratureItem from '../../literature/components/LiteratureItem';

function renderResultItem(result, rank) {
  return <LiteratureItem metadata={result.get('metadata')} searchRank={rank} />;
}

function EmbeddedLiteratureSearch({
  loadingResults,
  numberOfResults,
  query,
  sortOptions,
  error,
  results,
  loadingAggregations,
  aggregations,
  initialAggregations,
  baseAggregationsQuery,
  onQueryChange,
  onOptionsChange,
}) {
  const onAggregationChange = useCallback(
    (aggregationKey, selections) => {
      onQueryChange({ [aggregationKey]: selections, page: 1 });
    },
    [onQueryChange]
  );
  const onSortChange = useCallback(
    sort => {
      onQueryChange({ sort, page: 1 });
    },
    [onQueryChange]
  );
  const onPageChange = useCallback(
    page => {
      onQueryChange({ page });
    },
    [onQueryChange]
  );

  useEffect(
    () => {
      onOptionsChange({ baseAggregationsQuery, pidType: 'literature' });
    },
    [onOptionsChange, baseAggregationsQuery]
  );

  return (
    !error && (
      <Row gutter={{ xs: 0, lg: 32 }} type="flex" justify="start">
        <ResponsiveView
          min="lg"
          render={() => (
            <Col xs={0} lg={7}>
              <LoadingOrChildren loading={loadingAggregations}>
                <AggregationFilters
                  query={query}
                  aggregations={aggregations}
                  initialAggregations={initialAggregations}
                  numberOfResults={numberOfResults}
                  onAggregationChange={onAggregationChange}
                />
              </LoadingOrChildren>
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
                      <LoadingOrChildren loading={loadingAggregations}>
                        <AggregationFilters
                          query={query}
                          aggregations={aggregations}
                          initialAggregations={initialAggregations}
                          numberOfResults={numberOfResults}
                          onAggregationChange={onAggregationChange}
                        />
                      </LoadingOrChildren>
                    </DrawerHandle>
                  </Col>
                )}
              />
              <Col>
                <SortBy
                  onSortChange={onSortChange}
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
                  onPageChange={onPageChange}
                />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    )
  );
}

EmbeddedLiteratureSearch.propTypes = {
  query: PropTypes.objectOf(PropTypes.any).isRequired, // requires size and page
  onQueryChange: PropTypes.func.isRequired,
  onOptionsChange: PropTypes.func.isRequired,

  baseAggregationsQuery: PropTypes.object,

  results: PropTypes.instanceOf(List).isRequired,
  aggregations: PropTypes.instanceOf(Map).isRequired,
  initialAggregations: PropTypes.instanceOf(Map).isRequired,
  sortOptions: SelectOptionsPropType,
  numberOfResults: PropTypes.number.isRequired,
  loadingResults: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Map),
};

export default EmbeddedLiteratureSearch;
