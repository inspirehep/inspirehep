import React, { useEffect, useState } from 'react';
import { Breadcrumb, Input } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Action, ActionCreator } from 'redux';
import { connect } from 'react-redux';
import { RootState } from '../../../../types';
import { searchQueryUpdate } from '../../../../actions/search';
import './Breadcrumbs.less';
import { BACKOFFICE } from '../../../../common/routes';
import { BACKOFFICE_LITERATURE_SEARCH_NS } from '../../../../search/constants';
import Latex from '../../../../common/components/Latex';

type BreadcrumbItemProps = {
  namespace: string;
  onSearch: (namespace: string, value: string) => void;
  query: string;
  title1: string;
  href1: string;
  title2?: string;
  dashboardPage?: boolean;
};

const Breadcrumbs = ({
  namespace,
  onSearch,
  query,
  title1,
  href1,
  title2,
  dashboardPage = false,
}: BreadcrumbItemProps) => {
  const [inputValue, setInputValue] = useState(query || '');

  const { Search } = Input;

  useEffect(() => {
    setInputValue(query || '');
  }, [query]);

  const shouldWrapTitle2WithLatex =
    namespace === BACKOFFICE_LITERATURE_SEARCH_NS && !!title2;

  const breadcrumbItems = [
    {
      href: '/',
      title: (
        <>
          <HomeOutlined className="mr2" /> Inspirehep
        </>
      ),
    },
    {
      href: BACKOFFICE,
      title: 'Backoffice',
    },
    {
      href: `${BACKOFFICE}/${href1}`,
      title: title1,
    },
    ...(title2
      ? [
          {
            title: shouldWrapTitle2WithLatex ? (
              <Latex>{title2}</Latex>
            ) : (
              <p className="mv0">{title2}</p>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="flex items-center justify-between mt3 mb2">
      <Breadcrumb separator=">" items={breadcrumbItems} />
      {!dashboardPage && (
        <Search
          enterButton
          placeholder="Search Backoffice"
          onPressEnter={(event: React.KeyboardEvent<HTMLInputElement>) => {
            onSearch(namespace, event?.currentTarget?.value);
          }}
          onSearch={(value: string) => {
            onSearch(namespace, value);
          }}
          onChange={(event) => setInputValue(event?.target?.value)}
          value={inputValue}
          className="search-bar-small"
        />
      )}
    </div>
  );
};

const stateToProps = (
  state: RootState,
  { namespace }: { namespace: string }
) => ({
  query: state.search.getIn(['namespaces', namespace, 'query', 'q']),
});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSearch(namespace: string, value: string) {
    dispatch(searchQueryUpdate(namespace, { q: value || undefined }));
  },
});

export default connect(stateToProps, dispatchToProps)(Breadcrumbs);
