/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Row, Col } from 'antd';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { List, Map } from 'immutable';

import './SearchPageContainer.less';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import { SEARCH_PAGE_GUTTER } from '../../../common/constants';
import SearchResults from '../../../common/components/SearchResults';
import NumberOfResults from '../../../common/components/NumberOfResults';
import SearchPagination from '../../../common/components/SearchPagination';
import PublicationsSelectAllContainer from '../../../authors/containers/PublicationsSelectAllContainer';
import AuthorResultItem from '../../components/ResultItem/AuthorResultItem';
import {
  fetchSearchResults,
  searchQueryUpdate,
} from '../../../actions/holdingpen';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import SearchFilters from '../../components/SearchFilters';

interface SearchPageContainerProps {
  dispatch: ActionCreator<Action>;
  results: List<any>;
  loading: boolean;
  totalResults: number;
  query: Map<string, any>;
}

const renderResultItem = (item: Map<string, any>) => {
  return <AuthorResultItem item={item} key={item.get('id')} />;
};

const SearchPageContainer: React.FC<SearchPageContainerProps> = ({
  dispatch,
  results,
  totalResults,
  query,
}) => {
  useEffect(() => {
    dispatch(fetchSearchResults());
  }, [query]);

  return (
    <div
      className="__SearchPageContainer__"
      data-testid="holdingpen-search-page"
    >
      <Breadcrumbs title1="Search" href1="search" />
      <Row className="mt2 mb4" gutter={SEARCH_PAGE_GUTTER} justify="center">
        <SearchFilters />
        <Col xs={24} lg={20}>
          <EmptyOrChildren data={results} title="0 Results">
            <>
              <Row justify="space-between" wrap={false}>
                <PublicationsSelectAllContainer />
                <span className="mr2" />
                <Col style={{ width: '55%' }}>
                  <NumberOfResults numberOfResults={totalResults} />
                </Col>
                <Col
                  style={{ width: '29%', paddingLeft: '5px', fontWeight: 600 }}
                >
                  Action & Status
                </Col>
                <Col
                  style={{ width: '18%', paddingLeft: '5px', fontWeight: 600 }}
                >
                  Submission Info
                </Col>
                <Col
                  style={{ width: '18%', paddingLeft: '5px', fontWeight: 600 }}
                >
                  Subject Areas
                </Col>
              </Row>
              <SearchResults
                results={results}
                renderItem={renderResultItem}
                page={query?.get('page') || 1}
                isCatalogerLoggedIn={false}
                pageSize={query?.get('size') || 10}
                isHoldingpen
              />
              <br />
              <br />
              <SearchPagination
                onPageChange={(page, size) =>
                  dispatch(searchQueryUpdate({ ...query.toJS(), page, size }))
                }
                onSizeChange={(_page, size) =>
                  dispatch(
                    searchQueryUpdate({ ...query.toJS(), page: 1, size })
                  )
                }
                page={query?.get('page') || 1}
                total={totalResults}
                pageSize={query?.get('size') || 10}
              />
            </>
          </EmptyOrChildren>
        </Col>
      </Row>
    </div>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  results: state.holdingpen.get('searchResults'),
  loading: state.holdingpen.get('loading'),
  totalResults: state.holdingpen.get('totalResults'),
  query: state.holdingpen.get('query'),
});

export default connect(stateToProps)(SearchPageContainer);
