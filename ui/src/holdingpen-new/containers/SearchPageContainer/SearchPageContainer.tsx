import React, { useState } from 'react';
import { Row, Col, Card, Checkbox, Select } from 'antd';
import { List } from 'immutable';

import './SearchPageContainer.less';
import { data, facets } from '../../mocks/mockSearchData';
import Breadcrumbs from '../../components/Breadcrumbs';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { SEARCH_PAGE_GUTTER } from '../../../common/constants';
import SearchResults from '../../../common/components/SearchResults';
import NumberOfResults from '../../../common/components/NumberOfResults';
import SearchPagination from '../../../common/components/SearchPagination';
import PublicationsSelectAllContainer from '../../../authors/containers/PublicationsSelectAllContainer';
import UnclickableTag from '../../../common/components/UnclickableTag';
import ResultItemWithActions from '../../components/ResultItemWithActions';
import ResultitemWithComparison from '../../components/ResultitemWithComparison';
import AuthorResultItem from '../../components/AuthorResultItem';

interface SearchPageContainerProps {
  data?: any;
}

const renderResultItem = (item: any) => {
  if (item.get('id') === 123456) {
    return <AuthorResultItem item={item} />;
  }
  if (item.get('id') === 6) {
    return <ResultitemWithComparison item={item} />;
  }
  return <ResultItemWithActions item={item} />;
};

const SearchPageContainer: React.FC<SearchPageContainerProps> = () => {
  const [loading, setLoading] = useState(true);

  const resolveLoading = () => {
    setTimeout(() => setLoading(false), 2500);
  };

  resolveLoading();

  return (
    <div
      className="__SearchPageContainer__"
      data-testid="holdingpen-search-page"
    >
      <Breadcrumbs title1="Search" href1="search" />
      <Row className="mt2 mb4" gutter={SEARCH_PAGE_GUTTER} justify="center">
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
                  <>
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
                          <UnclickableTag>{filter.doc_count}</UnclickableTag>
                        </Col>
                      </Row>
                    ))}
                  </>
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
              <NumberOfResults numberOfResults={data?.size} />
            </Col>
            <Col style={{ width: '29%', paddingLeft: '5px', fontWeight: 600 }}>
              Action & Status
            </Col>
            <Col style={{ width: '18%', paddingLeft: '5px', fontWeight: 600 }}>
              Submission Info
            </Col>
            <Col style={{ width: '18%', paddingLeft: '5px', fontWeight: 600 }}>
              Subject Areas
            </Col>
          </Row>
          <SearchResults
            results={List(data)}
            renderItem={renderResultItem}
            page={1}
            isCatalogerLoggedIn={false}
            pageSize={5}
          />
          <br />
          <br />
          <SearchPagination page={1} total={data?.size} pageSize={5} />
        </Col>
      </Row>
    </div>
  );
};

export default SearchPageContainer;
