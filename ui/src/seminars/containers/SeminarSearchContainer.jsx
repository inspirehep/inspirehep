import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'antd';
import { connect } from 'react-redux';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
import DrawerHandle from '../../common/components/DrawerHandle';
import { SEMINARS_NS, AUTHOR_SEMINARS_NS } from '../../search/constants';
import { SEARCH_PAGE_GUTTER, LOCAL_TIMEZONE } from '../../common/constants';
import SeminarItem from '../components/SeminarItem';
import SeminarStartDateFilterContainer from './SeminarStartDateFilterContainer';
import VerticalDivider from '../../common/VerticalDivider';
import SeminarTimezone from '../components/SeminarTimezone';
import { doTimezonesHaveDifferentTimes } from '../../common/utils';
import { searchBaseQueriesUpdate } from '../../actions/search';

function SeminarSearch({
  loading,
  loadingAggregations,
  selectedTimezone,
  namespace,
  baseQuery,
  onBaseQueryChange,
}) {
  const renderAggregations = useCallback(
    () => (
      <>
        <SeminarStartDateFilterContainer switchTitle="Upcoming seminars" />
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer namespace={namespace} />
        </LoadingOrChildren>
      </>
    ),
    [loadingAggregations, namespace]
  );

  useEffect(
    () => {
      // FIXME: this should be the responsibility of the parent component
      if (baseQuery) {
        onBaseQueryChange(namespace, baseQuery);
      }
    },
    [namespace, baseQuery, onBaseQueryChange]
  );

  const renderSeminarItem = useCallback(
    result => (
      <SeminarItem
        metadata={result.get('metadata')}
        selectedTimezone={selectedTimezone}
      />
    ),
    [selectedTimezone]
  );

  const timezoneDifferentThanLocal =
    selectedTimezone &&
    doTimezonesHaveDifferentTimes(selectedTimezone, LOCAL_TIMEZONE);
  const timezone = selectedTimezone || LOCAL_TIMEZONE;

  return (
    <Row
      className="mt3"
      gutter={SEARCH_PAGE_GUTTER}
      type="flex"
      justify="start"
    >
      <Col xs={0} lg={7}>
        <ResponsiveView min="lg" render={renderAggregations} />
      </Col>
      <Col xs={24} lg={17}>
        <LoadingOrChildren loading={loading}>
          <Row type="flex" align="middle" justify="end">
            <Col xs={24} lg={12}>
              <NumberOfResultsContainer namespace={namespace} />
              <VerticalDivider />
              {timezoneDifferentThanLocal ? (
                <Alert
                  type="error"
                  message={<SeminarTimezone timezone={timezone} />}
                  className="di"
                />
              ) : (
                <SeminarTimezone timezone={timezone} />
              )}
            </Col>
            <Col xs={12} lg={0}>
              <ResponsiveView
                max="md"
                render={() => (
                  <DrawerHandle
                    className="mt2"
                    handleText="Filter"
                    drawerTitle="Filter"
                  >
                    {renderAggregations()}
                  </DrawerHandle>
                )}
              />
            </Col>
            <Col className="tr" span={12}>
              <SortByContainer namespace={namespace} />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <ResultsContainer
                namespace={namespace}
                renderItem={renderSeminarItem}
              />
              <PaginationContainer namespace={namespace} />
            </Col>
          </Row>
        </LoadingOrChildren>
      </Col>
    </Row>
  );
}

SeminarSearch.propTypes = {
  namespace: PropTypes.oneOf([SEMINARS_NS, AUTHOR_SEMINARS_NS]),
  onBaseQueryChange: PropTypes.func,
  baseQuery: PropTypes.object,
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
  selectedTimezone: PropTypes.string,
};

const stateToProps = (state, { namespace }) => ({
  loading: state.search.getIn(['namespaces', namespace, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'loadingAggregations',
  ]),
  selectedTimezone: state.search.getIn([
    'namespaces',
    namespace,
    'query',
    'timezone',
  ]),
});

const dispatchToProps = dispatch => ({
  onBaseQueryChange(namespace, baseQuery) {
    dispatch(searchBaseQueriesUpdate(namespace, { baseQuery }));
  },
});

export default connect(stateToProps, dispatchToProps)(SeminarSearch);
