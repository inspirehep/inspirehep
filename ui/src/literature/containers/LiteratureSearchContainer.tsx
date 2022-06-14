import React, { useCallback, useEffect, useContext } from 'react';
import { Row, Col } from 'antd';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { List } from 'immutable';

import AggregationFiltersContainer from '../../common/containers/AggregationFiltersContainer';
import PaginationContainer from '../../common/containers/PaginationContainer';
import SortByContainer from '../../common/containers/SortByContainer';
import ResultsContainer from '../../common/containers/ResultsContainer';
import NumberOfResultsWithSelectedItemsNumber from '../components/NumberOfResultsWithSelectedItemsNumber';
import LoadingOrChildren from '../../common/components/LoadingOrChildren';
import ResponsiveView from '../../common/components/ResponsiveView';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
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

type OwnLiteratureSearchProps = {
    loading: boolean;
    loadingAggregations: boolean;
    namespace: string;
    numberOfSelected?: number;
    onBaseQueriesChange?: $TSFixMeFunction;
    baseQuery?: $TSFixMe;
    baseAggregationsQuery?: $TSFixMe;
    results?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    noResultsTitle?: string;
    noResultsDescription?: React.ReactNode;
    isCitationSummaryVisible: boolean;
    embedded?: boolean;
    enableCitationSummary?: boolean;
    isCatalogerLoggedIn?: boolean;
};

// @ts-expect-error ts-migrate(2565) FIXME: Property 'defaultProps' is used before being assig... Remove this comment to see the full error message
type LiteratureSearchProps = OwnLiteratureSearchProps & typeof LiteratureSearch.defaultProps;

function LiteratureSearch({ loading, loadingAggregations, namespace, baseQuery, baseAggregationsQuery, onBaseQueriesChange, results, noResultsTitle, noResultsDescription, isCitationSummaryVisible, embedded, enableCitationSummary, numberOfSelected, }: LiteratureSearchProps) {
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
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
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
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
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
                  renderItem={(result: $TSFixMe, isCatalogerLoggedIn: $TSFixMe, rank: $TSFixMe) => (
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

LiteratureSearch.defaultProps = {
  enableCitationSummary: true,
};

const stateToProps = (
  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'state' implicitly has an 'any' type.
  state,
  {
    namespace
  }: $TSFixMe
) => ({
  loading: state.search.getIn(['namespaces', namespace, 'loading']),

  loadingAggregations: state.search.getIn([
    'namespaces',
    namespace,
    'loadingAggregations',
  ]),

  results: state.search.getIn(['namespaces', namespace, 'results']),
  isCitationSummaryVisible: isCitationSummaryEnabled(state),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles']))
});

const dispatchToProps = (dispatch: $TSFixMe) => ({
  onBaseQueriesChange(namespace: $TSFixMe, baseQueries: $TSFixMe) {
    dispatch(searchBaseQueriesUpdate(namespace, baseQueries));
  }
});

export default connect(stateToProps, dispatchToProps)(LiteratureSearch);
