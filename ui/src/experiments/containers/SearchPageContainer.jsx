import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import ExperimentItem from '../components/ExperimentItem';
import { EXPERIMENTS_NS } from '../../search/constants';

const META_DESCRIPTION = 'Find experiments in High Energy Physics';
const TITLE = 'Experiments Search';

function renderExperimentItem(result) {
  return <ExperimentItem metadata={result.get('metadata')} />;
}

function ExperimentSearchPage({ loading }) {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row
        className="mt3"
        gutter={SEARCH_PAGE_GUTTER}
        type="flex"
        justify="center"
      >
        <Col xs={24} lg={16} xl={16} xxl={14}>
          <LoadingOrChildren loading={loading}>
            <Row>
              <Col>
                <NumberOfResultsContainer namespace={EXPERIMENTS_NS} />
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
    </>
  );
}

ExperimentSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loading: state.search.getIn(['namespaces', EXPERIMENTS_NS, 'loading']),
});

export default connect(stateToProps)(ExperimentSearchPage);
