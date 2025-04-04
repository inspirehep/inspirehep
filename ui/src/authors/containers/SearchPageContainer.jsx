import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';

import AuthorResultItem from '../components/AuthorResultItem';
import PaginationContainer from '../../common/containers/PaginationContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import DocumentHead from '../../common/components/DocumentHead';
import { AUTHORS_NS } from '../../search/constants';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import { APIButton } from '../../common/components/APIButton';
import { isSuperUser } from '../../common/authorization';
import { columnSize } from '../../common/utils';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';

const META_DESCRIPTION = 'Find authors in High Energy Physics';
const TITLE = 'Authors Search';

class SearchPage extends Component {
  static renderAuthorItem(result, isCatalogerLoggedIn) {
    return (
      <AuthorResultItem
        metadata={result.get('metadata')}
        isCatalogerLoggedIn={isCatalogerLoggedIn}
      />
    );
  }

  render() {
    const { loading, isSuperUserLoggedIn, results, numberOfResults } =
      this.props;
    return (
      <>
        <DocumentHead title={TITLE} description={META_DESCRIPTION} />
        <Row
          className="mt3"
          gutter={SEARCH_PAGE_GUTTER}
          type="flex"
          justify="center"
          data-testid="authors-search-page-container"
        >
          <Col {...columnSize(numberOfResults)}>
            <EmptyOrChildren data={results} title="0 Authors">
              <LoadingOrChildren loading={loading}>
                <Row>
                  <Col>
                    <NumberOfResultsContainer namespace={AUTHORS_NS} />
                    {isSuperUserLoggedIn && (
                      <APIButton url={window.location.href} />
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ResultsContainer
                      namespace={AUTHORS_NS}
                      renderItem={SearchPage.renderAuthorItem}
                    />
                    <PaginationContainer namespace={AUTHORS_NS} />
                  </Col>
                </Row>
              </LoadingOrChildren>
            </EmptyOrChildren>
          </Col>
        </Row>
      </>
    );
  }
}

SearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = (state) => ({
  loading: state.search.getIn(['namespaces', AUTHORS_NS, 'loading']),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
  results: state.search.getIn(['namespaces', AUTHORS_NS, 'results']),
  numberOfResults: state.search.getIn(['namespaces', AUTHORS_NS, 'total']),
});

export default connect(stateToProps)(SearchPage);
