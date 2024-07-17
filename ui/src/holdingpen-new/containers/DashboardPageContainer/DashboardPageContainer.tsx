import React from 'react';
import classNames from 'classnames';
import {
  WarningOutlined,
  CheckOutlined,
  StopOutlined,
  HourglassOutlined,
  LoadingOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { Card, Input, Select, Tabs } from 'antd';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
import { connect } from 'react-redux';

import './DashboardPageContainer.less';
import { tasks, actions } from './mockData';
import Breadcrumbs from '../../components/Breadcrumbs';
import { HOLDINGPEN_SEARCH_NEW } from '../../../common/routes';

interface DashboardPageContainerProps {
  dispatch: ActionCreator<Action>;
}

const TEXT_CENTER: Record<string | number, string & {}> = {
  textAlign: 'center',
};

const { Option } = Select;

const { Search } = Input;

const selectBefore = (
  <Select defaultValue={tasks?.[0]?.title} className="select-before">
    {tasks?.map((item: any) => {
      return (
        <Option value={item.title} key={item.title}>
          {item.title}
        </Option>
      );
    })}
    {actions?.map((item: any) => {
      return (
        <Option value={item.title} key={item.title}>
          {item.title}
        </Option>
      );
    })}
  </Select>
);

const getIcon = (action: string) => {
  switch (action.toLowerCase()) {
    case 'waiting':
      return <HourglassOutlined className="mr2" />;
    case 'awaiting decision':
      return <HourglassOutlined className="mr2" />;
    case 'error':
      return <WarningOutlined className="mr2" />;
    case 'halted':
      return <StopOutlined className="mr2" />;
    case 'completed':
      return <CheckOutlined className="mr2" />;
    case 'running':
      return <LoadingOutlined className="mr2" />;
    case 'initial':
      return <InfoCircleOutlined className="mr2" />;
    default:
      return null;
  }
};

const DashboardPageContainer: React.FC<DashboardPageContainerProps> = ({
  dispatch,
}) => {
  const tabItems = [
    {
      label: <h3>Tasks</h3>,
      key: '1',
      children: (
        <>
          <Link to={HOLDINGPEN_SEARCH_NEW} className="db w-100 tc f5 mt4">
            View all
          </Link>
          <div className="cards-container mt4">
            {tasks?.map((item: any) => (
              <Card
                title={
                  <div>
                    <p>{item.title}</p>
                    <p className={classNames('f2 mb0 black')}>{item.total}</p>
                    <Link to={HOLDINGPEN_SEARCH_NEW} className="normal f6">
                      View all
                    </Link>
                  </div>
                }
                headStyle={TEXT_CENTER}
                className={classNames(
                  item.title.toLowerCase().replace(/ /g, '-')
                )}
                key={item.title}
              >
                {item.actions.map((action: any) => (
                  <a href={HOLDINGPEN_SEARCH_NEW} key={action.action}>
                    <div
                      className={classNames(
                        'flex justify-between',
                        action.action.toLowerCase()
                      )}
                    >
                      <p>
                        {getIcon(action.action)}
                        {action.action}
                      </p>
                      <span className="b">{action.number}</span>
                    </div>
                  </a>
                ))}
              </Card>
            ))}
          </div>
        </>
      ),
    },
    {
      label: <h3>Actions</h3>,
      key: '2',
      children: (
        <>
          <Link to={HOLDINGPEN_SEARCH_NEW} className="db w-100 tc f5 mt4">
            View all
          </Link>
          <div className="cards-container mt4">
            {actions?.map((item: any) => (
              <Card
                title={
                  <div>
                    <p>{item.title}</p>
                    <p className={classNames('f2 mb0 black')}>{item.total}</p>
                    <Link to={HOLDINGPEN_SEARCH_NEW} className="normal f6">
                      View all
                    </Link>
                  </div>
                }
                headStyle={TEXT_CENTER}
                className={classNames(
                  item.title.toLowerCase().replace(/ /g, '-')
                )}
                key={item.title}
              >
                {item.actions.map((action: any) => (
                  <a href={HOLDINGPEN_SEARCH_NEW} key={action.action}>
                    <div
                      className={classNames(
                        'flex justify-between',
                        action.action.toLowerCase()
                      )}
                    >
                      <p>
                        {getIcon(action.action)}
                        {action.action}
                      </p>
                      <span className="b">{action.number}</span>
                    </div>
                  </a>
                ))}
              </Card>
            ))}
          </div>
        </>
      ),
    },
  ];

  return (
    <div
      className="__DashboardPageContainer__"
      data-testid="holdingpen-dashboard-page"
    >
      <Breadcrumbs title1="Dashboard" href1="dashboard" dashboardPage />
      <div className="inner-container mt4">
        <h2 className="f2 center">Search Holdingpen</h2>
        <div className="search-container">
          <Search
            addonBefore={selectBefore}
            enterButton
            onPressEnter={() => {
              dispatch(push(HOLDINGPEN_SEARCH_NEW));
            }}
            onSearch={() => {
              dispatch(push(HOLDINGPEN_SEARCH_NEW));
            }}
          />
        </div>
        <h2 className="f2 center mb4">Overview</h2>
        <Tabs centered items={tabItems} />
      </div>
    </div>
  );
};

export default connect(null)(DashboardPageContainer);
