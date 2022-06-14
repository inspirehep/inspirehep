import React, { useCallback } from 'react';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import ExperimentItem from '../components/ExperimentItem';
import { EXPERIMENTS_NS } from '../../search/constants';
import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import ResponsiveView from '../../common/components/ResponsiveView';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import DrawerHandle from '../../common/components/DrawerHandle.tsx';

const META_DESCRIPTION = 'Find experiments in High Energy Physics';
const TITLE = 'Experiments Search';

function renderExperimentItem(result: $TSFixMe) {
  return <ExperimentItem metadata={result.get('metadata')} />;
}

type ExperimentSearchPageProps = {
    loading: boolean;
    loadingAggregations: boolean;
};

function ExperimentSearchPage({ loading, loadingAggregations }: ExperimentSearchPageProps) {
  const renderAggregations = useCallback(
    () => (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer namespace={EXPERIMENTS_NS} />
      </LoadingOrChildren>
    ),
    [loadingAggregations]
  );

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <Row className="mt3" gutter={SEARCH_PAGE_GUTTER} justify="start">
            <Col xs={0} lg={7}>
              <ResponsiveView min="lg" render={renderAggregations} />
            </Col>
            <Col xs={24} lg={17}>
              <LoadingOrChildren loading={loading}>
                <Row>
                  <Col xs={24} lg={12}>
                    <NumberOfResultsContainer namespace={EXPERIMENTS_NS} />
                  </Col>
                  <Col xs={12} lg={0}>
                    <ResponsiveView
                      max="md"
                      render={() => (
                        <DrawerHandle handleText="Filter" drawerTitle="Filter">
                          {renderAggregations()}
                        </DrawerHandle>
                      )}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ResultsContainer
                      namespace={EXPERIMENTS_NS}
                      renderItem={renderExperimentItem}
                    />
                    <PaginationContainer namespace={EXPERIMENTS_NS} />
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
  loading: state.search.getIn(['namespaces', EXPERIMENTS_NS, 'loading']),

  loadingAggregations: state.search.getIn([
    'namespaces',
    EXPERIMENTS_NS,
    'loadingAggregations',
  ])
});

export default connect(stateToProps)(ExperimentSearchPage);
