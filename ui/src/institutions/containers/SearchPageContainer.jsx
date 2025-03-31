import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { INSTITUTIONS_NS } from '../../search/constants';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import InstitutionItem from '../components/InstitutionItem';
import { isSuperUser } from '../../common/authorization';
import { APIButton } from '../../common/components/APIButton';
import { columnSize } from '../../common/utils';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';

const META_DESCRIPTION = 'Find institutions in High Energy Physics';
const TITLE = 'Institutions Search';

function renderInstitutionItem(result) {
  return <InstitutionItem metadata={result.get('metadata')} />;
}

function InstitutionSearchPage({
  loading,
  isSuperUserLoggedIn,
  results,
  numberOfResults,
}) {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row
        className="mt3"
        gutter={SEARCH_PAGE_GUTTER}
        type="flex"
        justify="center"
        data-testid="institutions-search-page-container"
      >
        <Col {...columnSize(numberOfResults)}>
          <EmptyOrChildren data={results} title="0 Institutions">
            <LoadingOrChildren loading={loading}>
              <Row>
                <Col>
                  <NumberOfResultsContainer namespace={INSTITUTIONS_NS} />
                  {isSuperUserLoggedIn && (
                    <APIButton url={window.location.href} />
                  )}
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
          </EmptyOrChildren>
        </Col>
      </Row>
    </>
  );
}

InstitutionSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = (state) => ({
  loading: state.search.getIn(['namespaces', INSTITUTIONS_NS, 'loading']),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
  results: state.search.getIn(['namespaces', INSTITUTIONS_NS, 'results']),
  numberOfResults: state.search.getIn(['namespaces', INSTITUTIONS_NS, 'total']),
});

export default connect(stateToProps)(InstitutionSearchPage);
