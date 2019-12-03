import React, { useCallback } from 'react';
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
import DocumentHead from '../../common/components/DocumentHead';
import { CONFERENCES_NS } from '../../reducers/search';
import ConferenceItem from '../components/ConferenceItem';
import ConferenceStartDateFilterContainer from './ConferenceStartDateFilterContainer';

function renderConferenceItem(result) {
  return <ConferenceItem metadata={result.get('metadata')} />;
}

function ConferenceSearchPage({ loading, loadingAggregations }) {
  const renderAggregations = useCallback(
    () => (
      <>
        <ConferenceStartDateFilterContainer />
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer
            displayWhenNoResults
            namespace={CONFERENCES_NS}
          />
        </LoadingOrChildren>
      </>
    ),
    [loadingAggregations]
  );

  return (
    <>
      <DocumentHead title="Conferences Search" />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <Row className="mt3" gutter={32} type="flex" justify="start">
            <Col xs={0} lg={7}>
              <ResponsiveView min="lg" render={renderAggregations} />
            </Col>
            <Col xs={24} lg={17}>
              <LoadingOrChildren loading={loading}>
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

ConferenceSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loading: state.search.getIn(['namespaces', CONFERENCES_NS, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    CONFERENCES_NS,
    'loadingAggregations',
  ]),
});

export default connect(stateToProps)(ConferenceSearchPage);
