import React, { useState } from 'react';
import { Row, Col, Select, Card, Checkbox } from 'antd';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { List, Map } from 'immutable';

import PaginationContainer from '../../../../common/containers/PaginationContainer';
import ResultsContainer from '../../../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../../../common/components/LoadingOrChildren';
import DocumentHead from '../../../../common/components/DocumentHead';
import { SEARCH_PAGE_GUTTER } from '../../../../common/constants';
import { searchQueryUpdate } from '../../../../actions/search';
import { BACKOFFICE_LITERATURE_SEARCH_NS } from '../../../../search/constants';
import AggregationFiltersContainer from '../../../../common/containers/AggregationFiltersContainer';
import ResponsiveView from '../../../../common/components/ResponsiveView';
import DrawerHandle from '../../../../common/components/DrawerHandle';
import AggregationBox from '../../../../common/components/AggregationBox';
import WorkflowResultItem from '../../components/WorkflowResultItem';
import Breadcrumbs from '../../../common/components/Breadcrumbs/Breadcrumbs';
import EmptyOrChildren from '../../../../common/components/EmptyOrChildren';
import { resolveLiteratureAction } from '../../../../actions/backoffice';
import { WorkflowStatuses } from '../../../constants';
import LiteratureMatches from '../../components/LiteratureMatches';
import { forceArray } from '../../../../common/utils';
import LiteratureBatchOperationsCard from '../../components/LiteratureBatchOperationsCard';

type BackofficeSearchPageProps = {
  loading: boolean;
  query: any;
  loadingAggregations: boolean;
  results: List<Map<string, any>>;
  actionInProgress?: Map<string, any> | null;
  onSortByChange: (namespace: string, value: string) => void;
  onHandleResolveAction: (
    workflowId: string,
    action: string,
    value: string
  ) => void;
};

const META_DESCRIPTION = 'Find literature workflows in backoffice';
const TITLE = 'Search literature - Backoffice';
const SELECTABLE_STATUSES = new Set([
  WorkflowStatuses.APPROVAL,
  WorkflowStatuses.APPROVAL_CORE_SELECTION,
]);

function renderWorkflowItem(
  item: Map<string, any>,
  onHandleResolveAction: (
    workflowId: string,
    action: string,
    value: string
  ) => void,
  actionInProgress?: Map<string, any> | null,
  selectedStatusesFromFacet?: Set<string>,
  selectedWorkflowIds?: Set<string>,
  onWorkflowSelectChange?: (workflowId: string, checked: boolean) => void
) {
  const workflowId = item?.get('id');
  const matches = item?.get('matches');
  const fuzzyMatches = matches?.get('fuzzy');
  const status = item?.get('status');
  const shouldShowSelectionCheckbox =
    !!status &&
    SELECTABLE_STATUSES.has(status) &&
    !!selectedStatusesFromFacet?.has(status);
  const hasFuzzyMatches =
    !!fuzzyMatches?.size && status === WorkflowStatuses.APPROVAL_FUZZY_MATCHING;

  const handleResolveAction = (action: string, value: string) =>
    onHandleResolveAction(workflowId, action, value);

  return (
    <>
      <WorkflowResultItem
        item={item}
        compactBottom={hasFuzzyMatches}
        handleResolveAction={handleResolveAction}
        actionInProgress={actionInProgress}
        shouldShowSelectionCheckbox={shouldShowSelectionCheckbox}
        isSelected={selectedWorkflowIds?.has(workflowId)}
        onSelectionChange={onWorkflowSelectChange}
      />
      {hasFuzzyMatches && (
        <Card>
          <LiteratureMatches
            fuzzyMatches={fuzzyMatches}
            handleResolveAction={handleResolveAction}
          />
        </Card>
      )}
    </>
  );
}

const LiteratureSearchPageContainer = ({
  loading,
  query,
  loadingAggregations,
  results,
  actionInProgress,
  onSortByChange,
  onHandleResolveAction,
}: BackofficeSearchPageProps) => {
  const statusSelections = (forceArray(query?.get('status')) || []) as string[];
  const selectedStatusesFromFacet = new Set<string>(statusSelections);
  const selectedStatus = statusSelections[0] as WorkflowStatuses | undefined;
  const batchStatus = SELECTABLE_STATUSES.has(
    selectedStatus as WorkflowStatuses
  )
    ? (selectedStatus as
        | WorkflowStatuses.APPROVAL
        | WorkflowStatuses.APPROVAL_CORE_SELECTION)
    : undefined;
  const hasSelectableStatusFacet = !!batchStatus;
  const [selectedWorkflowIds, setSelectedWorkflowIds] = useState<Set<string>>(
    new Set()
  );

  const currentPageWorkflowIds: string[] =
    results?.map((item: Map<string, any>) => item?.get('id'))?.toArray() || [];

  const selectedSelectableCount = currentPageWorkflowIds.filter((workflowId) =>
    selectedWorkflowIds.has(workflowId)
  ).length;
  const shouldShowSelectAllCheckbox =
    hasSelectableStatusFacet && currentPageWorkflowIds.length > 0;
  const isSelectAllChecked =
    shouldShowSelectAllCheckbox &&
    selectedSelectableCount === currentPageWorkflowIds.length;
  const isSelectAllIndeterminate =
    selectedSelectableCount > 0 &&
    selectedSelectableCount < currentPageWorkflowIds.length;

  const handleWorkflowSelectChange = (workflowId: string, checked: boolean) =>
    setSelectedWorkflowIds((previousSelectedWorkflowIds) => {
      const nextSelectedWorkflowIds = new Set(previousSelectedWorkflowIds);

      if (checked) {
        nextSelectedWorkflowIds.add(workflowId);
      } else {
        nextSelectedWorkflowIds.delete(workflowId);
      }

      return nextSelectedWorkflowIds;
    });

  const handleSelectAllChange = (checked: boolean) =>
    setSelectedWorkflowIds((previousSelectedWorkflowIds) => {
      const nextSelectedWorkflowIds = new Set(previousSelectedWorkflowIds);

      currentPageWorkflowIds.forEach((workflowId) => {
        if (checked) {
          nextSelectedWorkflowIds.add(workflowId);
        } else {
          nextSelectedWorkflowIds.delete(workflowId);
        }
      });

      return nextSelectedWorkflowIds;
    });

  const handleBatchResolveAction = (action: string) => {};

  const renderAggregations = () => (
    <LoadingOrChildren loading={loadingAggregations}>
      <AggregationFiltersContainer
        namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
      />
    </LoadingOrChildren>
  );

  return (
    <div
      className="__SearchPageContainer__"
      data-testid="backoffice-search-page"
    >
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Breadcrumbs
        namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
        title1="Search literature"
        href1="literature/search"
      />
      <Row justify="center">
        <EmptyOrChildren data={results} title="0 Results">
          <Col xs={24} lg={24} xl={24} xxl={24}>
            <Row className="mt3" gutter={SEARCH_PAGE_GUTTER} justify="start">
              <Col xs={0} lg={6}>
                <Card size="small">
                  <div style={{ padding: '0.5rem' }}>
                    <AggregationBox name="Sort by">
                      <Select
                        defaultValue="-_updated_at"
                        value={query?.get('ordering')}
                        style={{ width: '100%' }}
                        data-testid="select-sort-by"
                        options={[
                          { value: '-_updated_at', label: 'Most recent' },
                          { value: '_updated_at', label: 'Least recent' },
                        ]}
                        onChange={(value: string) =>
                          onSortByChange(BACKOFFICE_LITERATURE_SEARCH_NS, value)
                        }
                      />
                    </AggregationBox>
                  </div>
                  {renderAggregations()}
                </Card>
              </Col>
              <Col xs={24} lg={18}>
                {batchStatus && selectedWorkflowIds.size > 0 && (
                  <LiteratureBatchOperationsCard
                    selectedCount={selectedWorkflowIds.size}
                    status={batchStatus}
                    onResolveAction={handleBatchResolveAction}
                    actionInProgress={actionInProgress}
                  />
                )}
                <Row justify="space-between" wrap={false}>
                  <span className="mr2" />
                  <Col style={{ width: '55%' }}>
                    {!shouldShowSelectAllCheckbox ? (
                      <NumberOfResultsContainer
                        namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
                      />
                    ) : (
                      <div
                        className="flex items-center"
                        style={{ gap: '14px' }}
                      >
                        <Checkbox
                          checked={isSelectAllChecked}
                          indeterminate={isSelectAllIndeterminate}
                          aria-label="Select all workflows"
                          onChange={(event) =>
                            handleSelectAllChange(event.target.checked)
                          }
                        />
                        <NumberOfResultsContainer
                          namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
                        />
                      </div>
                    )}
                  </Col>
                  <Col
                    style={{
                      width: '29%',
                      paddingLeft: '5px',
                      fontWeight: 600,
                    }}
                  >
                    Action & Status
                  </Col>
                  <Col
                    style={{
                      width: '18%',
                      paddingLeft: '5px',
                      fontWeight: 600,
                    }}
                  >
                    Submission Info
                  </Col>
                  <Col
                    style={{
                      width: '18%',
                      paddingLeft: '5px',
                      fontWeight: 600,
                    }}
                  >
                    Subject Areas
                  </Col>
                </Row>
                <LoadingOrChildren loading={loading}>
                  <Row>
                    <Col xs={12} lg={0}>
                      <ResponsiveView
                        max="md"
                        render={() => (
                          <DrawerHandle
                            handleText="Filter"
                            drawerTitle="Filter"
                          >
                            <div style={{ padding: '0.5rem' }}>
                              <AggregationBox name="Sort by">
                                <Select
                                  defaultValue="-_updated_at"
                                  value={query?.get('ordering')}
                                  style={{ width: '100%' }}
                                  data-testid="select-sort-by"
                                  options={[
                                    {
                                      value: '-_updated_at',
                                      label: 'Most recent',
                                    },
                                    {
                                      value: '_updated_at',
                                      label: 'Least recent',
                                    },
                                  ]}
                                  onChange={(value: string) =>
                                    onSortByChange(
                                      BACKOFFICE_LITERATURE_SEARCH_NS,
                                      value
                                    )
                                  }
                                />
                              </AggregationBox>
                            </div>
                            {renderAggregations()}
                          </DrawerHandle>
                        )}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <ResultsContainer
                        namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
                        renderItem={(item: Map<string, any>) =>
                          renderWorkflowItem(
                            item,
                            onHandleResolveAction,
                            actionInProgress,
                            selectedStatusesFromFacet,
                            selectedWorkflowIds,
                            handleWorkflowSelectChange
                          )
                        }
                      />
                      <PaginationContainer
                        namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
                      />
                    </Col>
                  </Row>
                </LoadingOrChildren>
              </Col>
            </Row>
          </Col>
        </EmptyOrChildren>
      </Row>
    </div>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  loading: state.search.getIn([
    'namespaces',
    BACKOFFICE_LITERATURE_SEARCH_NS,
    'loading',
  ]),
  loadingAggregations: state.search.getIn([
    'namespaces',
    BACKOFFICE_LITERATURE_SEARCH_NS,
    'loadingAggregations',
  ]),
  query: state.search.getIn([
    'namespaces',
    BACKOFFICE_LITERATURE_SEARCH_NS,
    'query',
  ]),
  results: state.search.getIn([
    'namespaces',
    BACKOFFICE_LITERATURE_SEARCH_NS,
    'results',
  ]),
  actionInProgress: state.backoffice.get('actionInProgress'),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSortByChange(namespace: string, value: string) {
    dispatch(searchQueryUpdate(namespace, { ordering: value }));
  },
  onHandleResolveAction(workflowId: string, action: string, value: string) {
    const payload = {
      action,
      value,
    };
    dispatch(resolveLiteratureAction(workflowId, payload));
  },
});

export default connect(
  stateToProps,
  dispatchToProps
)(LiteratureSearchPageContainer);
