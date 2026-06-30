import React, { useCallback, useEffect, useMemo } from 'react';
import { Input, Select, Row, Col } from 'antd';
import { Action, ActionCreator } from 'redux';
import { connect } from 'react-redux';
import { List, Map } from 'immutable';
import { RootState } from '../../../types';

import './DashboardPageContainer.less';
import { isUserLoggedInToBackoffice } from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { handleSearch, COLLECTIONS } from '../../utils/utils';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';
import {
  BACKOFFICE_AUTHORS_SEARCH_NS,
  BACKOFFICE_LITERATURE_SEARCH_NS,
} from '../../../search/constants';
import { getConfigFor } from '../../../common/config';
import WorkflowCard from '../components/WorkflowCard';
import {
  CollapseState,
  STATUS_GROUPS_CONFIG,
  WORKFLOW_STATUS_TO_STATUS_GROUP,
  WORKFLOW_TYPE_ORDER,
  WorkflowStatuses,
  WorkflowTypes,
} from '../../constants';
import CollapseAllButton from '../components/CollapseAllButton';
import { setPreference } from '../../../actions/user';
import {
  BACKOFFICE_SEARCH_OPTION_PREFERENCE,
  BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE,
} from '../../../reducers/user';

const EMPTY_MAP = Map();

interface DashboardPageContainerProps {
  dispatch: ActionCreator<Action>;
  authors: Map<string, any>;
  literature: Map<string, any>;
  loading: boolean;
  collapsePreferences: Map<string, boolean>;
  searchPreference:
    | typeof BACKOFFICE_AUTHORS_SEARCH_NS
    | typeof BACKOFFICE_LITERATURE_SEARCH_NS;
}

const META_DESCRIPTION =
  'Welcome to the Backoffice Dashboard. Manage workflows, track statuses, and access important tools and resources to streamline your backoffice operations.';
const TITLE = 'Home - Backoffice';

const { Search } = Input;
const { Option } = Select;

const DashboardPageContainer = ({
  dispatch,
  authors,
  literature,
  loading,
  collapsePreferences,
  searchPreference,
}: DashboardPageContainerProps) => {
  useEffect(() => {
    dispatch(isUserLoggedInToBackoffice());
  }, [dispatch]);

  const workflowTypes: List<Map<string, any>> = useMemo(() => {
    const getWorkflowTypePosition = (workflowType: string) => {
      const position = WORKFLOW_TYPE_ORDER.indexOf(
        workflowType as WorkflowTypes
      );
      return position === -1 ? Number.MAX_SAFE_INTEGER : position;
    };

    const getWorkflowTypeBuckets = (
      data: Map<string, any> | undefined
    ): List<Map<string, any>> => {
      return (
        (data?.getIn([
          '_filter_workflow_type',
          'workflow_type',
          'buckets',
        ]) as List<Map<string, any>>) || List()
      );
    };

    const authorsWorkflowTypes = getWorkflowTypeBuckets(authors);
    const literatureWorkflowTypes = getWorkflowTypeBuckets(literature);

    return authorsWorkflowTypes
      .concat(literatureWorkflowTypes)
      .sortBy((type: Map<string, any>) =>
        getWorkflowTypePosition(type?.get('key'))
      ) as List<Map<string, any>>;
  }, [authors, literature]);

  const activeCollapsableGroupKeys = useMemo(
    () =>
      workflowTypes.toArray().flatMap((type: Map<string, any>) => {
        const collection = COLLECTIONS.find(
          (col) => col.value === type.get('key')
        );
        if (!collection) return [];

        const statuses =
          (type.getIn(['status', 'buckets']) as List<Map<string, any>>) ||
          List();

        const collapsableGroups = [
          ...new Set(
            statuses
              .toArray()
              .map(
                (status) =>
                  WORKFLOW_STATUS_TO_STATUS_GROUP[
                    status.get('key') as WorkflowStatuses
                  ]
              )
              .filter(
                (group) => group && STATUS_GROUPS_CONFIG[group]?.isCollapsable
              )
          ),
        ];

        return collapsableGroups.map((group) => `${collection.key}-${group}`);
      }),
    [workflowTypes]
  );

  const statusGroupsState = useMemo(() => {
    const hasAnyOpen = activeCollapsableGroupKeys.some(
      (key) => collapsePreferences.get(key) === true
    );
    const hasAnyClosed = activeCollapsableGroupKeys.some(
      (key) => collapsePreferences.get(key) !== true
    );
    if (!hasAnyOpen) return CollapseState.ALL_COLLAPSED;
    if (!hasAnyClosed) return CollapseState.ALL_EXPANDED;
    return CollapseState.MIXED;
  }, [activeCollapsableGroupKeys, collapsePreferences]);

  const setGroupCollapseState = (key: string, isOpen: boolean) => {
    dispatch(
      setPreference(
        BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE,
        collapsePreferences.set(key, isOpen)
      )
    );
  };

  const handleCollapseAll = useCallback(
    (isExpanding: boolean) => {
      const updatedPrefs = activeCollapsableGroupKeys.reduce(
        (map, key) => map.set(key, isExpanding),
        collapsePreferences
      );
      dispatch(
        setPreference(
          BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE,
          updatedPrefs
        )
      );
    },
    [dispatch, collapsePreferences, activeCollapsableGroupKeys]
  );

  return (
    <div
      className="__DashboardPageContainer__"
      data-testid="backoffice-dashboard-page"
    >
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Breadcrumbs namespace="" title1="Dashboard" href1="" dashboardPage />
      <div className="inner-container mt2">
        <div className="content-grid">
          <Search
            className="search-container"
            enterButton
            addonBefore={
              <Select
                value={searchPreference}
                onChange={(
                  value:
                    | typeof BACKOFFICE_AUTHORS_SEARCH_NS
                    | typeof BACKOFFICE_LITERATURE_SEARCH_NS
                ) =>
                  dispatch(
                    setPreference(BACKOFFICE_SEARCH_OPTION_PREFERENCE, value)
                  )
                }
              >
                {getConfigFor('BACKOFFICE_LITERATURE_FEATURE_FLAG') && (
                  <Option value={BACKOFFICE_LITERATURE_SEARCH_NS}>
                    Literature
                  </Option>
                )}
                <Option value={BACKOFFICE_AUTHORS_SEARCH_NS}>Authors</Option>
              </Select>
            }
            placeholder="Search Backoffice"
            onSearch={(value) =>
              handleSearch(dispatch, value, searchPreference)
            }
          />
        </div>
        <div className="flex w-100 justify-end pt3 content-grid">
          <CollapseAllButton
            collapseState={statusGroupsState}
            onCollapseAll={handleCollapseAll}
          />
        </div>
        <LoadingOrChildren loading={loading}>
          <EmptyOrChildren data={authors || literature} title="0 Results">
            <div className="content-grid">
              <Row
                gutter={[20, 20]}
                justify="center"
                className="cards-container mt2"
              >
                {workflowTypes?.map((type: Map<string, any>) => (
                  <Col
                    key={type?.get('key')}
                    xs={24}
                    sm={12}
                    xl={6}
                    className="workflow-card-col"
                  >
                    <WorkflowCard
                      type={type}
                      statuses={
                        (type?.getIn(['status', 'buckets']) as List<
                          Map<string, any>
                        >) || List()
                      }
                      collapseMap={collapsePreferences}
                      onGroupCollapseStateChange={setGroupCollapseState}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          </EmptyOrChildren>
        </LoadingOrChildren>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => ({
  authors: state.backoffice.getIn(['dashboard', 'facets', 'authors']),
  literature: state.backoffice.getIn(['dashboard', 'facets', 'literature']),
  loading: state.backoffice.getIn(['dashboard', 'loading']),
  collapsePreferences: state.user.getIn(
    ['preferences', BACKOFFICE_STATUS_GROUPS_COLLAPSE_PREFERENCE],
    EMPTY_MAP
  ),
  searchPreference: state.user.getIn(
    ['preferences', BACKOFFICE_SEARCH_OPTION_PREFERENCE],
    BACKOFFICE_AUTHORS_SEARCH_NS
  ),
});

export default connect(mapStateToProps)(DashboardPageContainer);
