import React, { useCallback } from 'react';
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
import DocumentHead from '../../common/components/DocumentHead';
import { SEMINARS_NS } from '../../reducers/search';
import { SEARCH_PAGE_GUTTER, LOCAL_TIMEZONE } from '../../common/constants';
import SeminarItem from '../components/SeminarItem';
import SeminarStartDateFilterContainer from './SeminarStartDateFilterContainer';
import VerticalDivider from '../../common/VerticalDivider';
import SeminarTimezone from '../components/SeminarTimezone';
import { doTimezonesHaveDifferentTimes } from '../../common/utils';

const META_DESCRIPTION = 'Find seminars in High Energy Physics';
const TITLE = 'Seminars Search';

function SeminarSearchPage({ loading, loadingAggregations, selectedTimezone }) {
  const renderAggregations = useCallback(
    () => (
      <>
        <SeminarStartDateFilterContainer switchTitle="Upcoming seminars" />
        <LoadingOrChildren loading={loadingAggregations}>
          <AggregationFiltersContainer
            displayWhenNoResults
            namespace={SEMINARS_NS}
          />
        </LoadingOrChildren>
      </>
    ),
    [loadingAggregations]
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
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
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
                    <NumberOfResultsContainer namespace={SEMINARS_NS} />
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
                    <SortByContainer namespace={SEMINARS_NS} />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ResultsContainer
                      namespace={SEMINARS_NS}
                      renderItem={renderSeminarItem}
                    />
                    <PaginationContainer namespace={SEMINARS_NS} />
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

SeminarSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
  selectedTimezone: PropTypes.string,
};

const stateToProps = state => ({
  loading: state.search.getIn(['namespaces', SEMINARS_NS, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    SEMINARS_NS,
    'loadingAggregations',
  ]),
  selectedTimezone: state.search.getIn([
    'namespaces',
    SEMINARS_NS,
    'query',
    'timezone',
  ]),
});

export default connect(stateToProps)(SeminarSearchPage);
