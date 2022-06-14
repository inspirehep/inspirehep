import React, { useCallback } from 'react';
import { Row, Col, Alert } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import DrawerHandle from '../../common/components/DrawerHandle.tsx';
import { SEMINARS_NS, AUTHOR_SEMINARS_NS } from '../../search/constants';
import { SEARCH_PAGE_GUTTER, LOCAL_TIMEZONE } from '../../common/constants';
import SeminarItem from '../components/SeminarItem';
import SeminarStartDateFilterContainer from './SeminarStartDateFilterContainer';
import VerticalDivider from '../../common/VerticalDivider';
import SeminarTimezone from '../components/SeminarTimezone';
import { doTimezonesHaveDifferentTimes } from '../../common/utils';

type SeminarSearchProps = {
    namespace?: $TSFixMe; // TODO: PropTypes.oneOf([SEMINARS_NS, AUTHOR_SEMINARS_NS])
    baseQuery?: $TSFixMe;
    loading: boolean;
    loadingAggregations: boolean;
    selectedTimezone?: string;
    enableDateFilter?: boolean;
    embedded?: boolean;
};

function SeminarSearch({ loading, loadingAggregations, selectedTimezone, namespace, enableDateFilter, embedded, }: SeminarSearchProps) {
  const renderAggregations = useCallback(
    () => (
      <>
        {enableDateFilter && (
          <SeminarStartDateFilterContainer
            namespace={namespace}
            switchTitle="Upcoming seminars"
          />
        )}
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer
            namespace={namespace}
            embedded={embedded}
          />
        </LoadingOrChildren>
      </>
    ),
    [loadingAggregations, enableDateFilter, namespace, embedded]
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      type="flex"
      justify="start"
    >
      <Col xs={0} lg={7}>
        <ResponsiveView min="lg" render={renderAggregations} />
      </Col>
      <Col xs={24} lg={17}>
        <LoadingOrChildren loading={loading}>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <Row type="flex" align="middle" justify="end">
            <Col xs={24} lg={12}>
              <NumberOfResultsContainer namespace={namespace} />
              <VerticalDivider />
              {timezoneDifferentThanLocal ? (
                <Alert
                  type="error"
                  // @ts-expect-error ts-migrate(2786) FIXME: 'SeminarTimezone' cannot be used as a JSX componen... Remove this comment to see the full error message
                  message={<SeminarTimezone timezone={timezone} />}
                  className="di"
                />
              ) : (
                // @ts-expect-error ts-migrate(2786) FIXME: 'SeminarTimezone' cannot be used as a JSX componen... Remove this comment to see the full error message
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

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: $TSFixMe
) => ({
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
  ])
});

export default connect(stateToProps)(SeminarSearch);
