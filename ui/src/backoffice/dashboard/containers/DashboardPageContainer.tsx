import React, { useEffect, useMemo, useState } from 'react';
import { Input, Tabs, Select } from 'antd';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { List, Map } from 'immutable';

import './DashboardPageContainer.less';
import { isUserLoggedInToBackoffice } from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { handleSearch } from '../../utils/utils';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';
import {
  BACKOFFICE_AUTHORS_SEARCH_NS,
  BACKOFFICE_LITERATURE_SEARCH_NS,
} from '../../../search/constants';
import { getConfigFor } from '../../../common/config';
import WorkflowCard from '../components/WorkflowCard';

interface DashboardPageContainerProps {
  dispatch: ActionCreator<Action>;
  authors: Map<string, any>;
  literature: Map<string, any>;
  loading: boolean;
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
}: DashboardPageContainerProps) => {
  const [searchNamespace, setSearchNamespace] = useState<
    typeof BACKOFFICE_AUTHORS_SEARCH_NS | typeof BACKOFFICE_LITERATURE_SEARCH_NS
  >(BACKOFFICE_AUTHORS_SEARCH_NS);

  useEffect(() => {
    dispatch(isUserLoggedInToBackoffice());
  }, [dispatch]);

  const workflowTypes: List<Map<string, any>> = useMemo(() => {
    const workflowTypePath = [
      '_filter_workflow_type',
      'workflow_type',
      'buckets',
    ];

    const getWorkflowTypeBuckets = (
      data: Map<string, any> | undefined
    ): List<Map<string, any>> => {
      return (
        (data?.getIn(workflowTypePath) as List<Map<string, any>>) || List()
      );
    };

    const authorsWorkflowTypes = getWorkflowTypeBuckets(authors);
    const literatureWorkflowTypes = getWorkflowTypeBuckets(literature);

    return authorsWorkflowTypes.concat(literatureWorkflowTypes);
  }, [authors, literature]);

  const renderWorkflowCards = useMemo(
    () =>
      workflowTypes?.map((type: Map<string, any>) => (
        <WorkflowCard
          key={type?.get('key')}
          type={type}
          statuses={
            type?.getIn(['status', 'buckets']) as List<Map<string, any>>
          }
        />
      )),
    [workflowTypes]
  );

  const tabItems = [
    {
      label: <h3>Collections</h3>,
      key: '1',
      children: (
        <div className="cards-container mt4">{renderWorkflowCards}</div>
      ),
    },
  ];

  return (
    <div
      className="__DashboardPageContainer__"
      data-testid="backoffice-dashboard-page"
    >
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Breadcrumbs namespace="" title1="Dashboard" href1="" dashboardPage />
      <div className="inner-container mt4">
        <h2 className="f2 center">Search Backoffice</h2>
        <div className="search-container">
          <Search
            enterButton
            addonBefore={
              <Select value={searchNamespace} onChange={setSearchNamespace}>
                {getConfigFor('BACKOFFICE_LITERATURE_FEATURE_FLAG') && (
                  <Option value={BACKOFFICE_LITERATURE_SEARCH_NS}>
                    Literature
                  </Option>
                )}
                <Option value={BACKOFFICE_AUTHORS_SEARCH_NS}>Authors</Option>
              </Select>
            }
            placeholder="Search Backoffice"
            onSearch={(value) => handleSearch(dispatch, value, searchNamespace)}
          />
        </div>
        <h2 className="f2 center mb4">Overview</h2>
        <LoadingOrChildren loading={loading}>
          <EmptyOrChildren data={authors || literature} title="0 Results">
            <Tabs centered items={tabItems} />
          </EmptyOrChildren>
        </LoadingOrChildren>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  authors: state.backoffice.getIn(['dashboard', 'facets', 'authors']),
  literature: state.backoffice.getIn(['dashboard', 'facets', 'literature']),
  loading: state.backoffice.getIn(['dashboard', 'loading']),
});

export default connect(mapStateToProps)(DashboardPageContainer);
