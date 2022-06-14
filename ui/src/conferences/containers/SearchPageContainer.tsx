import React, { useCallback } from 'react';
import { Row, Col } from 'antd';
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
import DocumentHead from '../../common/components/DocumentHead';
import { CONFERENCES_NS } from '../../search/constants';
import ConferenceItem from '../components/ConferenceItem';
import ConferenceStartDateFilterContainer from './ConferenceStartDateFilterContainer';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';

const META_DESCRIPTION = 'Find conferences in High Energy Physics';
const TITLE = 'Conferences Search';

function renderConferenceItem(result: $TSFixMe) {
  return <ConferenceItem metadata={result.get('metadata')} />;
}

type ConferenceSearchPageProps = {
    loading: boolean;
    loadingAggregations: boolean;
};

function ConferenceSearchPage({ loading, loadingAggregations }: ConferenceSearchPageProps) {
  const renderAggregations = useCallback(
    () => (
      <>
        <ConferenceStartDateFilterContainer switchTitle="Upcoming conferences" />
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer namespace={CONFERENCES_NS} />
        </LoadingOrChildren>
      </>
    ),
    [loadingAggregations]
  );

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
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
                    <NumberOfResultsContainer namespace={CONFERENCES_NS} />
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
                    <SortByContainer namespace={CONFERENCES_NS} />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ResultsContainer
                      namespace={CONFERENCES_NS}
                      renderItem={renderConferenceItem}
                    />
                    <PaginationContainer namespace={CONFERENCES_NS} />
                  </Col>
                </Row>
              </LoadingOrChildren>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

const stateToProps = (state: $TSFixMe) => ({
  loading: state.search.getIn(['namespaces', CONFERENCES_NS, 'loading']),

  loadingAggregations: state.search.getIn([
    'namespaces',
    CONFERENCES_NS,
    'loadingAggregations',
  ])
});

export default connect(stateToProps)(ConferenceSearchPage);
