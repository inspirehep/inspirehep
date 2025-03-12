import React, { useEffect, useCallback, useMemo } from 'react';
import classNames from 'classnames';
import { Card, Input, Tabs } from 'antd';
import { Link } from 'react-router-dom';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { List, Map } from 'immutable';

import './DashboardPageContainer.less';
import { isUserLoggedInToBackoffice } from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { COLLECTIONS, getIcon } from '../../utils/utils';
import { searchQueryUpdate } from '../../../actions/search';
import { BACKOFFICE_SEARCH_NS } from '../../../search/constants';
import { BACKOFFICE_SEARCH } from '../../../common/routes';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';

interface DashboardPageContainerProps {
  dispatch: ActionCreator<Action>;
  facets: Map<string, any>;
  loading: boolean;
}

const META_DESCRIPTION =
  'Welcome to the Backoffice Dashboard. Manage workflows, track statuses, and access important tools and resources to streamline your backoffice operations.';
const TITLE = 'Home - Backoffice';

const { Search } = Input;

const TEXT_CENTER: Record<string | number, string & {}> = {
  textAlign: 'center',
};

const DashboardPageContainer = ({
  dispatch,
  facets,
  loading,
}: DashboardPageContainerProps) => {
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

  const renderWorkflowStatus = useCallback(
    (type: Map<string, any>) =>
      (type?.getIn(['status', 'buckets']) as List<any>)?.map((status) => (
        <a
          href={`${BACKOFFICE_SEARCH}?workflow_type=${type?.get(
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
    [dispatch]
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
                to={`${BACKOFFICE_SEARCH}?workflow_type=${type?.get('key')}`}
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
    [workflowTypes, renderWorkflowStatus, dispatch]
  );

  const tabItems = useMemo(
    () => [
      {
        label: <h3>Collections</h3>,
        key: '1',
        children: (
          <>
            <Link
              to={BACKOFFICE_SEARCH}
              className="db w-100 tc f5 mt4"
              data-testid="view-all"
            >
              View all
            </Link>
            <div className="cards-container mt4">{renderWorkflowCards}</div>
          </>
        ),
      },
    ],
    [renderWorkflowCards, dispatch]
  );

  return (
    <div
      className="__DashboardPageContainer__"
      data-testid="backoffice-dashboard-page"
    >
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Breadcrumbs title1="Dashboard" href1="" dashboardPage />
      <div className="inner-container mt4">
        <h2 className="f2 center">Search Backoffice</h2>
        <div className="search-container">
          <Search
            enterButton
            placeholder="Search Backoffice"
            onSearch={(value) =>
              dispatch(
                searchQueryUpdate(BACKOFFICE_SEARCH_NS, {
                  q: value || undefined,
                })
              )
            }
          />
        </div>
        <h2 className="f2 center mb4">Overview</h2>
        <EmptyOrChildren data={facets} title="0 Results">
          <LoadingOrChildren loading={loading}>
            <Tabs centered items={tabItems} />
          </LoadingOrChildren>
        </EmptyOrChildren>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  facets: state.backoffice.get('facets'),
  loading: state.backoffice.get('loading'),
});

export default connect(mapStateToProps)(DashboardPageContainer);
