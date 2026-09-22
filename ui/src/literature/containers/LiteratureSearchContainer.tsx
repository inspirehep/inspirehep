import { useCallback, useEffect, useContext } from 'react';
import { Row, Col } from 'antd';
import { legacy_connect as connect } from 'react-redux';
import { List, Map } from 'immutable';

import { Action, ActionCreator } from 'redux';
import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsWithSelectedItemsNumber from '../components/NumberOfResultsWithSelectedItemsNumber';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
import DrawerHandle from '../../common/components/DrawerHandle';
import LiteratureItemContainer from './LiteratureItemContainer';
import CiteAllActionContainer from './CiteAllActionContainer';
import VerticalDivider from '../../common/VerticalDivider';
import { searchBaseQueriesUpdate, SearchParams } from '../../actions/search';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import CitationSummarySwitchContainer, {
  isCitationSummaryEnabled,
} from './CitationSummarySwitchContainer';
import { SEARCH_PAGE_GUTTER } from '../../common/constants';
import { isCataloger, isSuperUser } from '../../common/authorization';
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
import { APIButton } from '../../common/components/APIButton';
import SearchFeedback from '../../common/components/SearchFeedback/SearchFeedback';
import EventTracker from '../../common/components/EventTracker';
import { getConfigFor } from '../../common/config';
import CitationSummaryBox from '../components/CitationSummaryBox';
import AiSearchAnswer from '../components/AiSearchAnswer';
import { RootState } from '../../types';

interface LiteratureSearchProps {
  loading: boolean;
  loadingAggregations: boolean;
  namespace: string;
  baseQuery: Record<string, any>;
  baseAggregationsQuery?: Record<string, any>;
  onBaseQueriesChange: (namespace: string, baseQueries: SearchParams) => void;
  results: List<any>;
  noResultsTitle: string;
  noResultsDescription?: React.ReactNode;
  isCitationSummaryVisible: boolean;
  embedded: boolean;
  enableCitationSummary?: boolean;
  numberOfSelected?: number;
  page: string;
  isSuperUserLoggedIn: boolean;
  aiSearch: Map<string, any>;
}

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
  enableCitationSummary = true,
  numberOfSelected,
  page,
  isSuperUserLoggedIn,
  aiSearch,
}: LiteratureSearchProps) {
  const renderAggregations = useCallback(
    () => (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer
          namespace={namespace}
          embedded={embedded}
          page={page}
        />
      </LoadingOrChildren>
    ),
    [loadingAggregations, namespace, embedded, page]
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

  const assignNotLoggedInViewCondition =
    assignNotLoggedInView && !assignNoProfileViewCondition;

  const showSearchFeedbackCardCondition =
    getConfigFor('SEARCH_FEEDBACK_CARD_FEATURE_FLAG') && !embedded;

  if (aiSearch != null && (!results || results.size === 0)) {
    return (
      <Row className="mt3" gutter={SEARCH_PAGE_GUTTER} justify="center">
        <Col xs={0} lg={7}>
          <ResponsiveView min="lg" render={renderAggregations} />
        </Col>
        <Col xs={24} lg={17}>
          <AiSearchAnswer aiSearch={aiSearch} />
        </Col>
      </Row>
    );
  }

  return (
    <Row className="mt3" gutter={SEARCH_PAGE_GUTTER} justify="center">
      <EmptyOrChildren
        data={results}
        title={noResultsTitle}
        description={noResultsDescription}
      >
        <>
          <Col xs={0} lg={7}>
            <ResponsiveView min="lg" render={renderAggregations} />
          </Col>
          <Col xs={24} lg={17}>
            <AiSearchAnswer aiSearch={aiSearch} />
            <LoadingOrChildren loading={loading}>
              <Row align="middle" justify="end">
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
                  {isSuperUserLoggedIn && (
                    <APIButton url={window.location.href} />
                  )}
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
                    renderItem={(
                      result: Map<string, any>,
                      isCatalogerLoggedIn: boolean,
                      rank: number
                    ) => (
                      <Row>
                        {(assignAuthorView || assignAuthorOwnProfileView) && (
                          <Col className="mr1" flex="0 1 1px">
                            <PublicationSelectContainer
                              recordId={
                                result.getIn([
                                  'metadata',
                                  'control_number',
                                ]) as number
                              }
                              claimed={
                                result.getIn(
                                  ['metadata', 'curated_relation'],
                                  false
                                ) as boolean
                              }
                              isOwnProfile={assignAuthorOwnProfileView}
                            />
                          </Col>
                        )}
                        {assignAuthorDifferentProfileView &&
                          !assignAuthorOwnProfileView && (
                            <Col className="mr1" flex="0 1 1px">
                              <PublicationSelectContainer
                                recordId={
                                  result.getIn([
                                    'metadata',
                                    'control_number',
                                  ]) as number
                                }
                                claimed={
                                  result.getIn(
                                    ['metadata', 'curated_relation'],
                                    false
                                  ) as boolean
                                }
                              />
                            </Col>
                          )}
                        {assignNoProfileViewCondition && (
                          <Col className="mr1" flex="0 1 1px">
                            <PublicationSelectContainer
                              disabled
                              recordId={
                                result.getIn([
                                  'metadata',
                                  'control_number',
                                ]) as number
                              }
                            />
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
                          <LiteratureItemContainer
                            metadata={result.get('metadata')}
                            searchRank={rank}
                            isCatalogerLoggedIn={isCatalogerLoggedIn}
                            namespace={namespace}
                            page={page}
                          />
                        </Col>
                      </Row>
                    )}
                  />
                  {showSearchFeedbackCardCondition && (
                    <EventTracker
                      eventCategory="Feedback modal"
                      eventAction="Open"
                      eventId="Bottom of results"
                    >
                      <SearchFeedback style={{ marginBottom: '10px' }} />
                    </EventTracker>
                  )}
                  <PaginationContainer namespace={namespace} />
                </Col>
              </Row>
            </LoadingOrChildren>
          </Col>
        </>
      </EmptyOrChildren>
    </Row>
  );
}

const stateToProps = (
  state: RootState,
  { namespace }: { namespace: string }
) => ({
  loading: state.search.getIn(['namespaces', namespace, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'loadingAggregations',
  ]),
  results: state.search.getIn(['namespaces', namespace, 'results']),
  aiSearch: state.search.getIn(['namespaces', namespace, 'aiSearch']),
  isCitationSummaryVisible: isCitationSummaryEnabled(state),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onBaseQueriesChange(namespace: string, baseQueries: SearchParams) {
    dispatch(searchBaseQueriesUpdate(namespace, baseQueries));
  },
});

export default connect(stateToProps, dispatchToProps)(LiteratureSearch);
