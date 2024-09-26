import React, { useEffect, useState } from 'react';
import { Breadcrumb, Input } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Map } from 'immutable';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';

import './Breadcrumbs.less';
import { BACKOFFICE } from '../../../common/routes';
import { handleSearch } from '../../utils/utils';

interface BreadcrumbItemProps {
  dispatch: ActionCreator<Action>;
  query: Map<string, any>;
  title1: string;
  href1: string;
  title2?: string;
  href2?: string;
  dashboardPage?: boolean;
}

const Breadcrumbs: React.FC<BreadcrumbItemProps> = ({
  dispatch,
  query,
  title1,
  href1,
  title2,
  href2,
  dashboardPage = false,
}) => {
  const [inputValue, setInputValue] = useState(query?.get('search'));

  const { Search } = Input;

  useEffect(() => {
    setInputValue(query?.get('search'));
  }, [query]);

  return (
    <div className="flex items-center justify-between">
      <Breadcrumb separator="|" className="mv4">
        <Breadcrumb.Item>
          <a href="/">
            <HomeOutlined className="mr2" /> Inspirehep
          </a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href={BACKOFFICE}>Backoffice</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href={`${BACKOFFICE}/${title2 ? 'search' : href1}`}>{title1}</a>
        </Breadcrumb.Item>
        {title2 && (
          <Breadcrumb.Item>
            <a href={`${BACKOFFICE}${href2}`}>{title2}</a>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
      {!dashboardPage && (
        <Search
          enterButton
          placeholder="Search Backoffice"
          onPressEnter={(event: React.KeyboardEvent<HTMLInputElement>) => {
            handleSearch(
              dispatch,
              query?.get('workflow_type'),
              event?.currentTarget?.value
            );
          }}
          onSearch={(value: string) => {
            handleSearch(dispatch, query?.get('workflow_type'), value);
          }}
          onChange={(event) => setInputValue(event?.target?.value)}
          value={inputValue}
          className="search-bar-small"
        />
      )}
    </div>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  query: state.backoffice.get('query'),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  dispatch,
});

export default connect(stateToProps, dispatchToProps)(Breadcrumbs);
