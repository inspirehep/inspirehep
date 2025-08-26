import React, { useEffect, useCallback, useMemo, useState } from 'react';
import classNames from 'classnames';
import { Card, Input, Tabs, Select } from 'antd';
import { Link } from 'react-router-dom';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { List, Map } from 'immutable';

import './DashboardPageContainer.less';
import { isUserLoggedInToBackoffice } from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { COLLECTIONS, getIcon, handleSearch } from '../../utils/utils';
import {
  BACKOFFICE_AUTHORS_SEARCH,
  BACKOFFICE_LITERATURE_SEARCH,
} from '../../../common/routes';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';
import {
  BACKOFFICE_AUTHORS_SEARCH_NS,
  BACKOFFICE_LITERATURE_SEARCH_NS,
} from '../../../search/constants';
import { getConfigFor } from '../../../common/config';

interface DashboardPageContainerProps {
  dispatch: ActionCreator<Action>;
  facets: Map<string, any>;
  loading: boolean;
}

const META_DESCRIPTION =
  'Welcome to the Backoffice Dashboard. Manage workflows, track statuses, and access important tools and resources to streamline your backoffice operations.';
const TITLE = 'Home - Backoffice';

const { Search } = Input;
const { Option } = Select;

const TEXT_CENTER: Record<string | number, string & {}> = {
  textAlign: 'center',
};

const DashboardPageContainer = ({
  dispatch,
  facets,
  loading,
}: DashboardPageContainerProps) => {
  const [searchNamespace, setSearchNamespace] = useState<
    typeof BACKOFFICE_AUTHORS_SEARCH_NS | typeof BACKOFFICE_LITERATURE_SEARCH_NS
  >(BACKOFFICE_AUTHORS_SEARCH_NS);
  useEffect(() => {
    dispatch(isUserLoggedInToBackoffice());
  }, [dispatch]);

  const workflowTypes: List<Map<string, any>> = useMemo(() => {
    return facets?.getIn([
      '_filter_workflow_type',
      'workflow_type',
      'buckets',
    ]) as List<Map<string, any>>;
  }, [facets]);

  const getBackofficeSearchRoute = useCallback((workflowType?: string) => {
    if (workflowType === 'AUTHOR_CREATE' || workflowType === 'AUTHOR_UPDATE') {
      return BACKOFFICE_AUTHORS_SEARCH;
    }
    if (workflowType === 'HEP_CREATE') {
      return BACKOFFICE_LITERATURE_SEARCH;
    }
    return BACKOFFICE_LITERATURE_SEARCH;
  }, []);

  const renderWorkflowStatus = useCallback(
    (type: Map<string, any>) =>
      (type?.getIn(['status', 'buckets']) as List<any>)?.map((status) => (
        <a
          href={`${getBackofficeSearchRoute(type?.get('key'))}?workflow_type=${type?.get(
            'key'
          )}&status=${status?.get('key')}`}
          key={status?.get('key')}
        >
          <div
            className={classNames(
              'flex justify-between',
              status?.get('key')?.toLowerCase()
            )}
          >
            <p className="ttc">
              {getIcon(status?.get('key'))}
              {status?.get('key')}
            </p>
            <span className="b">{status?.get('doc_count')}</span>
          </div>
        </a>
      )),
    [getBackofficeSearchRoute]
  );

  const renderWorkflowCards = useMemo(
    () =>
      workflowTypes?.map((type: Map<string, any>) => (
        <Card
          title={
            <div>
              <p>
                {
                  COLLECTIONS.find(
                    (collection) => collection?.value === type?.get('key')
                  )?.key
                }
              </p>
              <p className={classNames('f2 mb0 black')}>
                {type?.get('doc_count')}
              </p>
              <Link
                to={`${getBackofficeSearchRoute(type?.get('key'))}?workflow_type=${type?.get('key')}`}
                className="normal f6"
              >
                View all
              </Link>
            </div>
          }
          headStyle={TEXT_CENTER}
          className={COLLECTIONS.find(
            (collection) => collection?.value === type?.get('key')
          )
            ?.key.toLowerCase()
            .replace(/ /g, '-')}
          key={type?.get('key')}
        >
          {renderWorkflowStatus(type)}
        </Card>
      )),
    [workflowTypes, renderWorkflowStatus, getBackofficeSearchRoute]
  );

  const tabItems = useMemo(
    () => [
      {
        label: <h3>Collections</h3>,
        key: '1',
        children: (
          <div className="cards-container mt4">{renderWorkflowCards}</div>
        ),
      },
    ],
    [renderWorkflowCards]
  );

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
          <EmptyOrChildren data={facets} title="0 Results">
            <Tabs centered items={tabItems} />
          </EmptyOrChildren>
        </LoadingOrChildren>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  facets: state.backoffice.getIn(['dashboard', 'facets']),
  loading: state.backoffice.getIn(['dashboard', 'loading']),
});

export default connect(mapStateToProps)(DashboardPageContainer);
