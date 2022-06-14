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
    const { loading } = this.props;
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
                  <NumberOfResultsContainer namespace={AUTHORS_NS} />
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
});

export default connect(stateToProps)(SearchPage);
