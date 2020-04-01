import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { INSTITUTIONS_NS } from '../../reducers/search';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import InstitutionItem from '../components/InstitutionItem';

const META_DESCRIPTION = 'Find institutions in High Energy Physics';
const TITLE = 'Institutions Search';

function renderInstitutionItem(result) {
  return <InstitutionItem metadata={result.get('metadata')} />;
}

function InstitutionSearchPage({ loading }) {
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
                <NumberOfResultsContainer namespace={INSTITUTIONS_NS} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer
                  namespace={INSTITUTIONS_NS}
                  renderItem={renderInstitutionItem}
                />
                <PaginationContainer namespace={INSTITUTIONS_NS} />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    </>
  );
}

InstitutionSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = state => ({
  loading: state.search.getIn(['namespaces', INSTITUTIONS_NS, 'loading']),
});

export default connect(stateToProps)(InstitutionSearchPage);
