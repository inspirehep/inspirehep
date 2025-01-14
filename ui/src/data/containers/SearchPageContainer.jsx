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
import DataItem from '../components/DataItem';
import { DATA_NS } from '../../search/constants';
import { APIButton } from '../../common/components/APIButton';
import { isSuperUser } from '../../common/authorization';
import SortByContainer from '../../common/containers/SortByContainer';

const META_DESCRIPTION = 'Find data in High Energy Physics';
const TITLE = 'Data Search';

function renderDataItem(result) {
  return <DataItem metadata={result.get('metadata')} />;
}

function DataSearchPage({ loading, isSuperUserLoggedIn }) {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row
        className="mt3"
        gutter={SEARCH_PAGE_GUTTER}
        type="flex"
        justify="center"
        data-testid="search-page-container"
      >
        <Col xs={24} lg={16} xl={16} xxl={14}>
          <LoadingOrChildren loading={loading}>
            <Row type="flex" align="middle" justify="end">
              <Col xs={24} lg={12}>
                <NumberOfResultsContainer namespace={DATA_NS} />
                {!isSuperUserLoggedIn && (
                  <APIButton url={window.location.href} />
                )}
              </Col>
              <Col className="tr" span={12}>
                <SortByContainer namespace={DATA_NS} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <ResultsContainer
                  namespace={DATA_NS}
                  renderItem={renderDataItem}
                />
                <PaginationContainer namespace={DATA_NS} />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </Row>
    </>
  );
}

DataSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = (state) => ({
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
  loading: state.search.getIn(['namespaces', DATA_NS, 'loading']),
});

export default connect(stateToProps)(DataSearchPage);
