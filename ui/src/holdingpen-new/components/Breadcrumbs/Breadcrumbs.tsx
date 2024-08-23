import React from 'react';
import { Breadcrumb, Input } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { push } from 'connected-react-router';
import { Action, ActionCreator } from 'redux';
import { connect } from 'react-redux';

import './Breadcrumbs.less';
import { HOLDINGPEN_NEW, HOLDINGPEN_SEARCH_NEW } from '../../../common/routes';

interface BreadcrumbItemProps {
  dispatch: ActionCreator<Action>;
  title1: string;
  href1: string;
  title2?: string;
  href2?: string;
  dashboardPage?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbItemProps> = ({
  dispatch,
  title1,
  href1,
  title2,
  href2,
  dashboardPage = false,
}) => {
  const { Search } = Input;

  return (
    <div className="flex items-center justify-between">
      <Breadcrumb separator="|" className="mv4">
        <Breadcrumb.Item>
          <a href="/">
            <HomeOutlined className="mr2" /> Inspirehep
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href={HOLDINGPEN_NEW}>Holdingpen</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href={`${HOLDINGPEN_NEW}/${title2 ? 'search' : href1}`}>
            {title1}
          </a>
        </Breadcrumb.Item>
        {title2 && (
          <Breadcrumb.Item>
            <a href={`${HOLDINGPEN_NEW}${href2}`}>{title2}</a>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
      {!dashboardPage && (
        <Search
          enterButton
          placeholder="Search Holdingpen"
          onPressEnter={() => {
            dispatch(push(HOLDINGPEN_SEARCH_NEW));
          }}
          onSearch={() => {
            dispatch(push(HOLDINGPEN_SEARCH_NEW));
          }}
          className="search-bar-small"
        />
      )}
    </div>
  );
};

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  dispatch,
});

export default connect(null, dispatchToProps)(Breadcrumbs);
