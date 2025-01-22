import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Select, Card } from 'antd';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';

import PaginationContainer from '../../../common/containers/PaginationContainer';
import ResultsContainer from '../../../common/containers/ResultsContainer';
import NumberOfResultsContainer from '../../../common/containers/NumberOfResultsContainer';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import DocumentHead from '../../../common/components/DocumentHead';
import { SEARCH_PAGE_GUTTER } from '../../../common/constants';
import { searchQueryUpdate } from '../../../actions/search';
import { BACKOFFICE_SEARCH_NS } from '../../../search/constants';
import AggregationFiltersContainer from '../../../common/containers/AggregationFiltersContainer';
import ResponsiveView from '../../../common/components/ResponsiveView';
import DrawerHandle from '../../../common/components/DrawerHandle';
import AggregationBox from '../../../common/components/AggregationBox';
import { isSuperUser } from '../../../common/authorization';
import ResultItem from '../../common/components/ResultItem/ResultItem';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';


type BackofficeSearchPageProps = { 
  loading: boolean; 
  query: any; 
  loadingAggregations: boolean; 
  onSortByChange: (namespace: string, value: string) => void;
};

const META_DESCRIPTION = 'Find workflows in backoffice';
const TITLE = 'Workflows Search';

function renderWorkflowItem(item: Map<string, any>) {
  return <ResultItem item={item} key={item.get('id')} />;
}

const BackofficeSearchPage = ({ loading, query, loadingAggregations, onSortByChange }: BackofficeSearchPageProps ) => {
  const renderAggregations = useCallback(
    () => (
      <LoadingOrChildren loading={loadingAggregations}>
        <AggregationFiltersContainer namespace={BACKOFFICE_SEARCH_NS} page="Workflows search" />
      </LoadingOrChildren>
    ),
    [loadingAggregations]
  );
  return (
    <div
      className="__SearchPageContainer__"
      data-testid="backoffice-search-page"
    >
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Breadcrumbs title1="Search" href1="search" />
      <Row>
        <Col xs={24} lg={24} xl={24} xxl={24}>
          <Row className="mt3" gutter={SEARCH_PAGE_GUTTER} justify="start">
            <Col xs={0} lg={7}>
              <Card size="small">
                <div style={{ padding: '0.5rem' }}>
                  <AggregationBox name="Sort by">
                    <Select
                      defaultValue="-_updated_at"
                      value={query?.get('ordering')}
                      style={{ width: '100%', }}
                      data-testid="select-sort-by"
                      options={[
                        { value: '-_updated_at', label: 'Most recent' },
                        { value: '_updated_at', label: 'Least recent' },
                      ]}
                      onChange={(value: string) =>
                        onSortByChange(BACKOFFICE_SEARCH_NS, value)
                      }
                    />
                  </AggregationBox>
                </div>
                {renderAggregations()}
              </Card>
            </Col>
            <Col xs={24} lg={17}>
              <Row justify="space-between" wrap={false}>
                <span className="mr2" />
                <Col style={{ width: '55%' }}>
                  <NumberOfResultsContainer namespace={BACKOFFICE_SEARCH_NS} />
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
              <LoadingOrChildren loading={loading}>
                <Row>
                  <Col xs={12} lg={0}>
                    <ResponsiveView
                      max="md"
                      render={() => (
                        <DrawerHandle handleText="Filter" drawerTitle="Filter">

                          <div style={{ padding: '0.5rem' }}>
                            <AggregationBox name="Sort by">
                              <Select
                                defaultValue="-_updated_at"
                                value={query?.get('ordering')}
                                style={{ width: '100%', }}
                                data-testid="select-sort-by"
                                options={[
                                  { value: '-_updated_at', label: 'Most recent' },
                                  { value: '_updated_at', label: 'Least recent' },
                                ]}
                                onChange={(value: string) =>
                                  onSortByChange(BACKOFFICE_SEARCH_NS, value)
                                }
                              />
                            </AggregationBox>
                          </div>
                          {renderAggregations()}

                        </DrawerHandle>
                      )}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <ResultsContainer
                      namespace={BACKOFFICE_SEARCH_NS}
                      renderItem={renderWorkflowItem}
                    />
                    <PaginationContainer namespace={BACKOFFICE_SEARCH_NS} />
                  </Col>
                </Row>
              </LoadingOrChildren>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}

BackofficeSearchPage.propTypes = {
  loading: PropTypes.bool.isRequired,
};

const stateToProps = (state: RootStateOrAny) => ({
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
  loading: state.search.getIn(['namespaces', BACKOFFICE_SEARCH_NS, 'loading']),
  loadingAggregations: state.search.getIn([
    'namespaces',
    BACKOFFICE_SEARCH_NS,
    'loadingAggregations',
  ]),
  query: state.search.getIn([
    'namespaces',
    BACKOFFICE_SEARCH_NS,
    'query',
  ]),

});

export const dispatchToProps = (dispatch: ActionCreator<Action>) => ({
  onSortByChange(namespace: string, value: string) {
    /* @ts-ignore */
    dispatch(searchQueryUpdate(namespace, {ordering: value}));
  },
});

export default connect(stateToProps, dispatchToProps)(BackofficeSearchPage);
