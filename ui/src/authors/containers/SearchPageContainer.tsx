import React, { Component } from 'react';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
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

type SearchPageProps = {
    loading: boolean;
};

class SearchPage extends Component<SearchPageProps> {

  static renderAuthorItem(result: $TSFixMe, isCatalogerLoggedIn: $TSFixMe) {
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
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

const stateToProps = (state: $TSFixMe) => ({
  loading: state.search.getIn(['namespaces', AUTHORS_NS, 'loading'])
});

export default connect(stateToProps)(SearchPage);
