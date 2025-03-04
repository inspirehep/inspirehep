import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import DataItem from '../components/DataItem';
import { APIButton } from '../../common/components/APIButton';
import { isSuperUser } from '../../common/authorization';
import SortByContainer from '../../common/containers/SortByContainer';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import ResponsiveView from '../../common/components/ResponsiveView';
import DrawerHandle from '../../common/components/DrawerHandle';

const renderDataItem = (result) => (
  <DataItem metadata={result.get('metadata')} />
);

const DataSearchPage = ({
  loading,
  loadingAggregations,
  isSuperUserLoggedIn,
  namespace,
  embedded,
  results,
  page,
}) => {
  const renderAggregations = useCallback(
    () => (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer
          namespace={namespace}
          embedded={embedded}
          page={page}
        />
      </LoadingOrChildren>
    ),
    [loadingAggregations, namespace, embedded, page]
  );

  return (
    <Row
      className="mt3"
      gutter={SEARCH_PAGE_GUTTER}
      type="flex"
      justify="center"
      data-testid="data-search-page-container"
    >
      <EmptyOrChildren data={results} title="0 Datasets">
        <Col xs={0} lg={7}>
          <ResponsiveView min="lg" render={renderAggregations} />
        </Col>
        <Col xs={24} lg={17}>
          <LoadingOrChildren loading={loading}>
            <Row type="flex" align="middle" justify="end">
              <Col xs={24} lg={12}>
                <NumberOfResultsContainer namespace={namespace} />
                {isSuperUserLoggedIn && (
                  <APIButton url={window.location.href} />
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
                  renderItem={renderDataItem}
                />
                <PaginationContainer namespace={namespace} />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </EmptyOrChildren>
    </Row>
  );
};

DataSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  isSuperUserLoggedIn: PropTypes.bool.isRequired,
  embedded: PropTypes.bool,
  namespace: PropTypes.string.isRequired,
  results: PropTypes.object,
};

const stateToProps = (state, { namespace }) => ({
  results: state.search.getIn(['namespaces', namespace, 'results']),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
  loading: state.search.getIn(['namespaces', namespace, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'loadingAggregations',
  ]),
});

export default connect(stateToProps)(DataSearchPage);
