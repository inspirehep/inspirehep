import React, { useEffect, useState } from 'react';
import { Breadcrumb, Input } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { searchQueryUpdate } from '../../../../actions/search';
import './Breadcrumbs.less';
import { BACKOFFICE } from '../../../../common/routes';
import { BACKOFFICE_SEARCH_NS } from '../../../../search/constants';

type BreadcrumbItemProps = {
  onSearch: (namespace: string, value: string) => void;
  query: string;
  title1: string;
  href1: string;
  title2?: string;
  href2?: string;
  dashboardPage?: boolean;
}

const Breadcrumbs = ({
  onSearch,
  query,
  title1,
  href1,
  title2,
  href2,
  dashboardPage = false,
}: BreadcrumbItemProps) => {
  const [inputValue, setInputValue] = useState(query || '');

  const { Search } = Input;

  useEffect(() => {
    setInputValue(query || '');
  }, [query]);

  return (
    <div className="flex items-center justify-between">
      <Breadcrumb separator=">" className="mv4">
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
            <a href={`${BACKOFFICE}/${href2}`}>{title2}</a>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
      {!dashboardPage && (
        <Search
          enterButton
          placeholder="Search Backoffice"
          onPressEnter={(event: React.KeyboardEvent<HTMLInputElement>) => {
            onSearch(BACKOFFICE_SEARCH_NS, event?.currentTarget?.value)
          }}
          onSearch={(value: string) => {
            onSearch(BACKOFFICE_SEARCH_NS, value);
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
  query: state.search.getIn([
    'namespaces',
    BACKOFFICE_SEARCH_NS,
    'query',
    'q',
  ]),
  namespace: BACKOFFICE_SEARCH_NS,
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSearch(namespace: string, value: string) {
      dispatch(searchQueryUpdate(namespace, { q: value || undefined }));
  },
});

export default connect(stateToProps, dispatchToProps)(Breadcrumbs);
