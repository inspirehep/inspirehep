/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Row, Col, Card, Checkbox, Select } from 'antd';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { List, Map } from 'immutable';

import './SearchPageContainer.less';
import { facets } from '../../mocks/mockSearchData';
import Breadcrumbs from '../../components/Breadcrumbs';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { SEARCH_PAGE_GUTTER } from '../../../common/constants';
import SearchResults from '../../../common/components/SearchResults';
import NumberOfResults from '../../../common/components/NumberOfResults';
import SearchPagination from '../../../common/components/SearchPagination';
import PublicationsSelectAllContainer from '../../../authors/containers/PublicationsSelectAllContainer';
import UnclickableTag from '../../../common/components/UnclickableTag';
import AuthorResultItem from '../../components/AuthorResultItem';
import {
  fetchSearchResults,
  searchQueryUpdate,
} from '../../../actions/holdingpen';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';

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
  loading,
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
        <EmptyOrChildren data={results} title="0 Results">
          <>
            <Col xs={0} lg={5}>
              <LoadingOrChildren loading={loading}>
                <Card>
                  <p>Results per page</p>
                  <Select
                    defaultValue="10"
                    style={{ width: '100%', marginBottom: '1rem' }}
                    options={[
                      { value: '10', label: '10' },
                      { value: '25', label: '25' },
                      { value: '50', label: '50' },
                      { value: '100', label: '100' },
                    ]}
                  />
                  <p>Sort by</p>
                  <Select
                    defaultValue="most recent"
                    style={{ width: '100%', marginBottom: '1rem' }}
                    options={[
                      { value: 'most recent', label: 'Most recent' },
                      { value: 'best match', label: 'Best match' },
                      {
                        value: 'relevance desc',
                        label: 'Relevance Prediction (Desc)',
                      },
                      {
                        value: 'relevance asc',
                        label: 'Relevance Prediction (Asc)',
                      },
                    ]}
                  />
                  {facets.map(
                    (facet: {
                      category: string;
                      filters: { name: string; doc_count: number }[];
                    }) => (
                      <div key={facet.category}>
                        <Row>
                          <p className="facet-category">
                            Filter by {facet.category}
                          </p>
                        </Row>
                        {facet.filters.map((filter) => (
                          <Row
                            className="mb2"
                            justify="space-between"
                            key={filter.name}
                          >
                            <Col>
                              <Checkbox>
                                <span className="ttc">{filter.name}</span>
                              </Checkbox>
                            </Col>
                            <Col>
                              <UnclickableTag>
                                {filter.doc_count}
                              </UnclickableTag>
                            </Col>
                          </Row>
                        ))}
                      </div>
                    )
                  )}
                </Card>
              </LoadingOrChildren>
            </Col>
            <Col xs={24} lg={19}>
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
                  dispatch(searchQueryUpdate({ page, size }))
                }
                onSizeChange={(_page, size) =>
                  dispatch(searchQueryUpdate({ page: 1, size }))
                }
                page={query?.get('page') || 1}
                total={totalResults}
                pageSize={query?.get('size') || 10}
              />
            </Col>
          </>
        </EmptyOrChildren>
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
