import React, { useCallback, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { connect } from 'react-redux';
import { List } from 'immutable';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsWithSelectedItemsNumber from '../components/NumberOfResultsWithSelectedItemsNumber';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
import DrawerHandle from '../../common/components/DrawerHandle.tsx';
import LiteratureItem from '../components/LiteratureItem';
import CiteAllActionContainer from './CiteAllActionContainer';
import VerticalDivider from '../../common/VerticalDivider';
import { searchBaseQueriesUpdate } from '../../actions/search';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import CitationSummarySwitchContainer, {
  isCitationSummaryEnabled,
} from './CitationSummarySwitchContainer';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import { isCataloger } from '../../common/authorization';
import CitationSummaryBox from '../components/CitationSummaryBox';
import PublicationSelectContainer from '../../authors/containers/PublicationSelectContainer';
import PublicationsSelectAllContainer from '../../authors/containers/PublicationsSelectAllContainer';
import AssignAuthorViewContext from '../../authors/AssignViewContext';
import AssignConferenceViewContext from '../AssignViewContext';
import AssignAllActionContainer from '../../authors/containers/AssignAllActionContainer';
import AssignAllOwnProfileActionContainer from '../../authors/containers/AssignAllOwnProfileActionContainer';
import AssignViewOwnProfileContext from '../../authors/assignViewOwnProfileContext';
import AssignViewDifferentProfileContext from '../../authors/assignViewDifferentProfileContext';
import AssignViewNoProfileContext from '../../authors/assignViewNoProfileContext';
import AssignViewNotLoggedInContext from '../../authors/assignViewNotLoggedInContext';
import ToolActionContainer from './ToolActionContainer';
import LiteratureSelectAllContainer from './LiteratureSelectAllContainer';
import LiteratureSelectContainer from './LiteratureSelectContainer';
import AssignAllDifferentProfileActionContainer from '../../authors/containers/AssignAllDifferentProfileActionContainer';
import AssignNoProfileAction from '../../authors/components/AssignNoProfileAction';
import ClaimingDisabledButton from '../../authors/components/ClaimingDisabledButton';

function LiteratureSearch({
  loading,
  loadingAggregations,
  namespace,
  baseQuery,
  baseAggregationsQuery,
  onBaseQueriesChange,
  results,
  noResultsTitle,
  noResultsDescription,
  isCitationSummaryVisible,
  embedded,
  enableCitationSummary,
  numberOfSelected,
}) {
  const renderAggregations = useCallback(
    () => (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer
          namespace={namespace}
          embedded={embedded}
        />
      </LoadingOrChildren>
    ),
    [loadingAggregations, namespace, embedded]
  );

  useEffect(() => {
    // FIXME: this should be the responsibility of the parent component
    if (baseQuery || baseAggregationsQuery) {
      onBaseQueriesChange(namespace, {
        baseQuery,
        baseAggregationsQuery,
      });
    }
  }, [namespace, baseQuery, baseAggregationsQuery, onBaseQueriesChange]);

  const assignAuthorView = useContext(AssignAuthorViewContext);
  const assignAuthorOwnProfileView = useContext(AssignViewOwnProfileContext);
  const assignAuthorDifferentProfileView = useContext(
    AssignViewDifferentProfileContext
  );
  const assignAuthorNoProfileView = useContext(AssignViewNoProfileContext);
  const assignNotLoggedInView = useContext(AssignViewNotLoggedInContext);

  const assignConferenceView = useContext(AssignConferenceViewContext);
  const assignNoProfileViewCondition =
    assignAuthorNoProfileView &&
    !assignAuthorOwnProfileView &&
    !assignAuthorView &&
    !assignAuthorDifferentProfileView;

  const assignNotLoggedInViewCondition = assignNotLoggedInView && !assignNoProfileViewCondition;

  return (
    <Row
      className="mt3"
      gutter={SEARCH_PAGE_GUTTER}
      type="flex"
      justify="center"
    >
      <EmptyOrChildren
        data={results}
        title={noResultsTitle}
        description={noResultsDescription}
      >
        <Col xs={0} lg={7}>
          <ResponsiveView min="lg" render={renderAggregations} />
        </Col>
        <Col xs={24} lg={17}>
          <LoadingOrChildren loading={loading}>
            <Row type="flex" align="middle" justify="end">
              <Col xs={24} lg={12}>
                {(assignAuthorView ||
                  assignAuthorOwnProfileView ||
                  assignAuthorDifferentProfileView) && (
                  <span className="mr1">
                    <PublicationsSelectAllContainer />
                  </span>
                )}
                {assignNoProfileViewCondition && (
                  <span className="mr1">
                    <PublicationsSelectAllContainer disabled />
                  </span>
                )}
                {assignConferenceView && (
                  <span className="mr1">
                    <LiteratureSelectAllContainer />
                  </span>
                )}
                <NumberOfResultsWithSelectedItemsNumber
                  numberOfSelected={numberOfSelected}
                  namespace={namespace}
                />
                <VerticalDivider />
                <CiteAllActionContainer namespace={namespace} />
                {assignAuthorView && <AssignAllActionContainer />}
                {assignAuthorOwnProfileView && !assignAuthorView && (
                  <AssignAllOwnProfileActionContainer />
                )}
                {assignAuthorDifferentProfileView &&
                  !assignAuthorOwnProfileView && (
                    <AssignAllDifferentProfileActionContainer />
                  )}
                {assignNoProfileViewCondition && <AssignNoProfileAction />}
                {assignNotLoggedInViewCondition && <ClaimingDisabledButton />}
                {assignConferenceView && <ToolActionContainer />}
              </Col>
              <Col xs={8} lg={0}>
                <ResponsiveView
                  max="md"
                  render={() => (
                    <DrawerHandle handleText="Filter" drawerTitle="Filter">
                      {renderAggregations()}
                    </DrawerHandle>
                  )}
                />
              </Col>
              <Col className="tr" xs={16} lg={12}>
                {enableCitationSummary && (
                  <span className="mr2">
                    <CitationSummarySwitchContainer namespace={namespace} />
                  </span>
                )}
                <SortByContainer namespace={namespace} />
              </Col>
            </Row>
            {enableCitationSummary && isCitationSummaryVisible && (
              <Row className="mt2">
                <Col span={24}>
                  <CitationSummaryBox namespace={namespace} />
                </Col>
              </Row>
            )}
            <Row>
              <Col span={24}>
                <ResultsContainer
                  namespace={namespace}
                  renderItem={(result, isCatalogerLoggedIn, rank) => (
                    <Row>
                      {(assignAuthorView || assignAuthorOwnProfileView) && (
                        <Col className="mr1" flex="0 1 1px">
                          <PublicationSelectContainer
                            recordId={result.getIn([
                              'metadata',
                              'control_number',
                            ])}
                            claimed={result.getIn(
                              ['metadata', 'curated_relation'],
                              false
                            )}
                          />
                        </Col>
                      )}
                      {assignAuthorDifferentProfileView &&
                        !assignAuthorOwnProfileView && (
                          <Col className="mr1" flex="0 1 1px">
                            <PublicationSelectContainer
                              recordId={result.getIn([
                                'metadata',
                                'control_number',
                              ])}
                              claimed={result.getIn(
                                ['metadata', 'curated_relation'],
                                false
                              )}
                              canClaim={result.getIn(
                                ['metadata', 'can_claim'],
                                false
                              )}
                            />
                          </Col>
                        )}
                      {assignNoProfileViewCondition && (
                        <Col className="mr1" flex="0 1 1px">
                          <PublicationSelectContainer disabled />
                        </Col>
                      )}
                      {assignConferenceView && (
                        <Col className="mr1" flex="0 1 1px">
                          <LiteratureSelectContainer
                            recordId={result.getIn([
                              'metadata',
                              'control_number',
                            ])}
                          />
                        </Col>
                      )}
                      <Col flex="1 1 1px">
                        <LiteratureItem
                          metadata={result.get('metadata')}
                          searchRank={rank}
                          isCatalogerLoggedIn={isCatalogerLoggedIn}
                        />
                      </Col>
                    </Row>
                  )}
                />
                <PaginationContainer namespace={namespace} />
              </Col>
            </Row>
          </LoadingOrChildren>
        </Col>
      </EmptyOrChildren>
    </Row>
  );
}

LiteratureSearch.propTypes = {
  loading: PropTypes.bool.isRequired,
  loadingAggregations: PropTypes.bool.isRequired,
  namespace: PropTypes.string.isRequired,
  numberOfSelected: PropTypes.number,
  onBaseQueriesChange: PropTypes.func,
  baseQuery: PropTypes.object,
  baseAggregationsQuery: PropTypes.object,
  results: PropTypes.instanceOf(List),
  noResultsTitle: PropTypes.string,
  noResultsDescription: PropTypes.node,
  isCitationSummaryVisible: PropTypes.bool.isRequired,
  embedded: PropTypes.bool,
  enableCitationSummary: PropTypes.bool,
  isCatalogerLoggedIn: PropTypes.bool,
};

LiteratureSearch.defaultProps = {
  enableCitationSummary: true,
};

const stateToProps = (state, { namespace }) => ({
  loading: state.search.getIn(['namespaces', namespace, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'loadingAggregations',
  ]),
  results: state.search.getIn(['namespaces', namespace, 'results']),
  isCitationSummaryVisible: isCitationSummaryEnabled(state),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
});

const dispatchToProps = (dispatch) => ({
  onBaseQueriesChange(namespace, baseQueries) {
    dispatch(searchBaseQueriesUpdate(namespace, baseQueries));
  },
});

export default connect(stateToProps, dispatchToProps)(LiteratureSearch);
