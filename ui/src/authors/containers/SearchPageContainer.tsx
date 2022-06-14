import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

class SearchPage extends Component {
  static renderAuthorItem(result: any, isCatalogerLoggedIn: any) {
    return (
      <AuthorResultItem
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        metadata={result.get('metadata')}
        isCatalogerLoggedIn={isCatalogerLoggedIn}
      />
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'loading' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { loading } = this.props;
    return (
      <>
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        <DocumentHead title={TITLE} description={META_DESCRIPTION} />
        <Row
          className="mt3"
          gutter={SEARCH_PAGE_GUTTER}
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          type="flex"
          justify="center"
        >
          <Col xs={24} lg={16} xl={16} xxl={14}>
            // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = (state: any) => ({
  loading: state.search.getIn(['namespaces', AUTHORS_NS, 'loading'])
});

export default connect(stateToProps)(SearchPage);
