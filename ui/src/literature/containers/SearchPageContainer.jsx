import React from 'react';
import { Row, Col, Empty } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from './LiteratureSearchContainer';
import { LITERATURE_NS } from '../../search/constants';
import DocumentHead from '../../common/components/DocumentHead';
import LinkWithTargetBlank from '../../common/components/LinkWithTargetBlank';
import { PAPER_SEARCH_URL } from '../../common/constants';
import AssignViewContext from '../AssignViewContext';
import AssignConferencesDrawerContainer from './AssignConferencesDrawerContainer';
import { isCataloger, isSuperUser } from '../../common/authorization';

const META_DESCRIPTION =
  'Find articles, conference papers, proceedings, books, theses, reviews, lectures and reports in High Energy Physics';
const TITLE = 'Literature Search';

export function SearchPage({ assignView, numberOfSelected, error }) {
  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      {error &&
      error.get('message') === 'The syntax of the search query is invalid.' ? (
        <Row justify="center" className="mv3">
          <Col xs={24} lg={12}>
            <Empty
              className="invalid-query"
              image={<WarningOutlined />}
              description="The search query is malformed"
            >
              <em>
                Oops! You might want to check out our{' '}
                <LinkWithTargetBlank href={PAPER_SEARCH_URL}>
                  search tips
                </LinkWithTargetBlank>
                .
              </em>
            </Empty>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col xs={24} lg={22} xl={20} xxl={18}>
            <AssignViewContext.Provider value={assignView}>
              <LiteratureSearchContainer
                namespace={LITERATURE_NS}
                noResultsTitle="0 Results"
                page="Literature search"
                noResultsDescription={
                  <em>
                    Oops! You might want to check out our{' '}
                    <LinkWithTargetBlank href={PAPER_SEARCH_URL}>
                      search tips
                    </LinkWithTargetBlank>
                    .
                  </em>
                }
                numberOfSelected={numberOfSelected}
              />
              {assignView && <AssignConferencesDrawerContainer />}
            </AssignViewContext.Provider>
          </Col>
        </Row>
      )}
    </>
  );
}

SearchPage.propTypes = {
  assignView: PropTypes.bool.isRequired,
  numberOfSelected: PropTypes.number.isRequired,
};

const stateToProps = (state) => ({
  assignView:
    isSuperUser(state.user.getIn(['data', 'roles'])) ||
    isCataloger(state.user.getIn(['data', 'roles'])),
  numberOfSelected: state.literature.get('literatureSelection').size,
  error: state.search.getIn(['namespaces', 'literature', 'error']),
});

const SearchPageContainer = connect(stateToProps)(SearchPage);
export default SearchPageContainer;
