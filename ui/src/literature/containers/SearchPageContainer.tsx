import React from 'react';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import LiteratureSearchContainer from './LiteratureSearchContainer';
import { LITERATURE_NS } from '../../search/constants';
import DocumentHead from '../../common/components/DocumentHead';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import ExternalLink from '../../common/components/ExternalLink.tsx';
import { PAPER_SEARCH_URL } from '../../common/constants';
import AssignViewContext from '../AssignViewContext';
import AssignConferencesDrawerContainer from './AssignConferencesDrawerContainer';
import { isCataloger, isSuperUser } from '../../common/authorization';

const META_DESCRIPTION =
  'Find articles, conference papers, proceedings, books, theses, reviews, lectures and reports in High Energy Physics';
const TITLE = 'Literature Search';

export function SearchPage({
  assignView,
  numberOfSelected
}: any) {
  return (
    <>
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row>
        <Col xs={24} lg={22} xl={20} xxl={18}>
          <AssignViewContext.Provider value={assignView}>
            <LiteratureSearchContainer
              namespace={LITERATURE_NS}
              noResultsTitle="0 Results"
              noResultsDescription={
                <em>
                  Oops! You might want to check out our{' '}
                  <ExternalLink href={PAPER_SEARCH_URL}>
                    search tips
                  </ExternalLink>
                  .
                </em>
              }
              numberOfSelected={numberOfSelected}
            />
            {assignView && <AssignConferencesDrawerContainer />}
          </AssignViewContext.Provider>
        </Col>
      </Row>
    </>
  );
}

SearchPage.propTypes = {
  assignView: PropTypes.bool.isRequired,
  numberOfSelected: PropTypes.number.isRequired,
};

const stateToProps = (state: any) => ({
  assignView:
    isSuperUser(state.user.getIn(['data', 'roles'])) ||
    isCataloger(state.user.getIn(['data', 'roles'])),

  numberOfSelected: state.literature.get('literatureSelection').size
});

const SearchPageContainer = connect(stateToProps)(SearchPage);
export default SearchPageContainer;
