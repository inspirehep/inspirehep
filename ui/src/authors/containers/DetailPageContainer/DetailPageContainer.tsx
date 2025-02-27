import React, { useEffect, useMemo } from 'react';
import { connect, RootStateOrAny } from 'react-redux';
import { Action, ActionCreator } from 'redux';
import { Row, Col, Tabs, Tooltip } from 'antd';
import { Map, List } from 'immutable';
import { SettingOutlined } from '@ant-design/icons';

import './DetailPage.less';
import ContentBox from '../../../common/components/ContentBox';
import AuthorName from '../../components/AuthorName';
import ExperimentList from '../../../common/components/ExperimentList';
import fetchAuthor from '../../../actions/authors';
import { fetchCitationsByYear } from '../../../actions/citations';
import {
  getCurrentAffiliationsFromPositions,
  getAuthorDisplayName,
  getAuthorMetaDescription,
  getInspireId,
} from '../../utils';
import PositionsTimeline from '../../components/PositionsTimeline';
import ArxivCategoryList from '../../../common/components/ArxivCategoryList';
import AuthorTwitterAction from '../../components/AuthorTwitterAction';
import AuthorLinkedinAction from '../../components/AuthorLinkedinAction';
import AuthorWebsitesAction from '../../components/AuthorWebsitesAction';
import AuthorOrcid from '../../components/AuthorOrcid';
import DocumentHead from '../../../common/components/DocumentHead';
import TabNameWithCount from '../../../common/components/TabNameWithCount';
import AuthorCitationsContainer from '../AuthorCitationsContainer';
import AuthorEmailsAction from '../../components/AuthorEmailsAction';
import AuthorPublicationsContainer from '../AuthorPublicationsContainer';
import {
  AUTHOR_PUBLICATIONS_NS,
  AUTHOR_CITATIONS_NS,
  AUTHOR_SEMINARS_NS,
  AUTHOR_DATA_NS,
} from '../../../search/constants';
import { newSearch, searchBaseQueriesUpdate } from '../../../actions/search';
import DeletedAlert from '../../../common/components/DeletedAlert';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import AuthorBAI from '../../components/AuthorBAI';
import Advisors from '../../components/Advisors';
import AffiliationList from '../../../common/components/AffiliationList';
import RecordUpdateInfo from '../../../common/components/RecordUpdateInfo';
import AuthorSeminars from '../../components/AuthorSeminars';
import EditAuthorRecordAction from '../../components/EditAuthorRecordAction';
import { isCataloger, isSuperUser } from '../../../common/authorization';
import IconText from '../../../common/components/IconText';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import UserAction from '../../../common/components/UserAction';
import { APIButton } from '../../../common/components/APIButton';
import InspireID from '../../components/InspireID';
import AuthorBlueskyAction from '../../components/AuthorBlueskyAction';
import AuthorMastodonAction from '../../components/AuthorMastodonAction';
import DataSearchPageContainer from '../../../data/containers/DataSearchPageContainer';

function DetailPage({
  datasetsCount,
  dispatch,
  isCatalogerLoggedIn,
  isSuperUserLoggedIn,
  loadingPublications,
  publicationsCount,
  publicationsQuery,
  record,
  seminarsCount,
  userOrcid,
}: {
  datasetsCount: number;
  dispatch: ActionCreator<Action>;
  isCatalogerLoggedIn: boolean;
  isSuperUserLoggedIn: boolean;
  loadingPublications: boolean;
  publicationsCount: number;
  publicationsQuery: Map<string, string>;
  record: Map<string, any>;
  seminarsCount: number;
  userOrcid: string;
}) {
  const authorFacetName = publicationsQuery.getIn(['author', 0]) as string;
  const metadata = record.get('metadata');
  const updateTime = record.get('updated') as string;
  useEffect(
    () => {
      if (authorFacetName) {
        const query = publicationsQuery.toJS();
        dispatch(fetchCitationsByYear(query));
        dispatch(
          searchBaseQueriesUpdate(AUTHOR_DATA_NS, {
            baseQuery: {
              author: [authorFacetName],
            },
          })
        );
      }
    },
    [dispatch, authorFacetName] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const name = metadata.get('name');
  const recordId = metadata.get('control_number');

  const positions = metadata.get('positions', List());
  const currentPositions = useMemo(
    () => getCurrentAffiliationsFromPositions(positions),
    [positions]
  );
  const shouldDisplayPositions = metadata.get('should_display_positions');

  const arxivCategories = metadata.get('arxiv_categories');
  const experiments = metadata.get('project_membership');

  const twitter = metadata.get('twitter');
  const bluesky = metadata.get('bluesky');
  const mastodon = metadata.get('mastodon');
  const linkedin = metadata.get('linkedin');
  const urls = metadata.get('urls');
  const orcid = metadata.get('orcid');
  const emails = metadata.get('email_addresses');
  const deleted = metadata.get('deleted', false);
  const bai = metadata.get('bai');
  const advisors = metadata.get('advisors');
  const canEdit = metadata.get('can_edit', false);
  const inspireId = getInspireId(metadata.get('ids'));
  const hasDatasetsCount =
    datasetsCount !== null && datasetsCount !== undefined;

  const metaDescription = useMemo(
    () => getAuthorMetaDescription(metadata),
    [metadata]
  );

  const canAccessDataTab =
    (isCatalogerLoggedIn || isSuperUserLoggedIn) && hasDatasetsCount;

  let tabItems = [
    {
      label: (
        <Tooltip title="Literature from the author">
          <span>
            <TabNameWithCount
              loading={publicationsCount === null && loadingPublications}
              name="Literature"
              count={publicationsCount}
              page="Author detail"
            />
          </span>
        </Tooltip>
      ),
      key: '1',
      children: (
        <ContentBox className="remove-top-border-of-card">
          <AuthorPublicationsContainer />
        </ContentBox>
      ),
    },
  ];

  if (canAccessDataTab) {
    tabItems = [
      ...tabItems,
      {
        label: (
          <Tooltip title="Datasets from the author">
            <span>
              <span>
                Datasets <span> ({datasetsCount})</span>
              </span>
            </span>
          </Tooltip>
        ),
        key: '2',
        children: (
          <ContentBox className="remove-top-border-of-card">
            <DataSearchPageContainer namespace={AUTHOR_DATA_NS} />
          </ContentBox>
        ),
      },
    ];
  }

  tabItems = [
    ...tabItems,
    {
      label: (
        <Tooltip title="Research citing the author">
          <span>Cited By</span>
        </Tooltip>
      ),
      key: canAccessDataTab ? '3' : '2',
      children: (
        <ContentBox className="remove-top-border-of-card">
          <AuthorCitationsContainer />
        </ContentBox>
      ),
    },
  ];

  if (seminarsCount > 0) {
    tabItems = [
      ...tabItems,
      {
        label: (
          <Tooltip title="Seminars from the author">
            <span>Seminars</span>
          </Tooltip>
        ),
        key: canAccessDataTab ? '4' : '3',
        children: (
          <ContentBox className="remove-top-border-of-card">
            <AuthorSeminars />
          </ContentBox>
        ),
      },
    ];
  }

  return (
    <>
      <DocumentHead
        title={getAuthorDisplayName(name)}
        description={metaDescription}
      />
      <Row className="__DetailPage__" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row
            className="mv3"
            gutter={{ xs: 0, md: 16, xl: 32 }}
            justify="space-between"
          >
            <Col span={24}>
              <ContentBox
                className="sm-pb3"
                leftActions={
                  <>
                    {emails && <AuthorEmailsAction emails={emails} />}
                    {bluesky && <AuthorBlueskyAction bluesky={bluesky} />}
                    {mastodon && <AuthorMastodonAction mastodon={mastodon} />}
                    {twitter && <AuthorTwitterAction twitter={twitter} />}
                    {linkedin && <AuthorLinkedinAction linkedin={linkedin} />}
                    {urls && <AuthorWebsitesAction websites={urls} />}
                    {orcid && orcid === userOrcid && (
                      <UserAction>
                        <LinkWithTargetBlank href="/user/settings">
                          <IconText
                            text="settings"
                            icon={<SettingOutlined />}
                          />
                        </LinkWithTargetBlank>
                      </UserAction>
                    )}
                    <EditAuthorRecordAction
                      canEdit={canEdit}
                      pidValue={recordId}
                      isCatalogerLoggedIn={isCatalogerLoggedIn}
                      page="Author detail"
                    />
                    {isSuperUserLoggedIn && (
                      <APIButton url={window.location.href} />
                    )}
                  </>
                }
                rightActions={
                  <>
                    <RecordUpdateInfo updateDate={updateTime} />
                  </>
                }
              >
                <Row>
                  <Col span={24}>{deleted && <DeletedAlert />}</Col>
                </Row>
                <h2>
                  <AuthorName name={name} />
                  {currentPositions.size > 0 && (
                    <span className="pl1 f6">
                      (<AffiliationList affiliations={currentPositions} />)
                    </span>
                  )}
                  {orcid && (
                    <span className="pl1">
                      <AuthorOrcid orcid={orcid} />
                    </span>
                  )}
                </h2>
                <Row justify="space-between">
                  <Col xs={24} lg={12} className="mb3">
                    <ArxivCategoryList
                      arxivCategories={arxivCategories}
                      wrapperClassName="arxiv-category mb3"
                    />
                    <ExperimentList
                      experiments={experiments}
                      wrapperClassName="experiments"
                    />
                    {bai && <AuthorBAI bai={bai} />}
                    {!orcid && inspireId && <InspireID id={inspireId} />}
                    {advisors && (
                      <div className="mt2">
                        <Advisors advisors={advisors} />
                      </div>
                    )}
                  </Col>
                  <Col xs={24} lg={12}>
                    {shouldDisplayPositions && (
                      <PositionsTimeline positions={positions} />
                    )}
                  </Col>
                </Row>
              </ContentBox>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Tabs
                type="card"
                tabBarStyle={{ marginBottom: 0 }}
                items={tabItems}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

const mapStateToProps = (state: RootStateOrAny) => ({
  record: state.authors.get('data'),
  publicationsQuery: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'query',
  ]),
  publications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'results',
  ]),
  userOrcid: state.user.getIn(['data', 'orcid']),
  loadingPublications: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'loading',
  ]),
  publicationsCount: state.search.getIn([
    'namespaces',
    AUTHOR_PUBLICATIONS_NS,
    'initialTotal',
  ]),
  datasetsCount: state.search.getIn([
    'namespaces',
    AUTHOR_DATA_NS,
    'initialTotal',
  ]),
  seminarsCount: state.search.getIn([
    'namespaces',
    AUTHOR_SEMINARS_NS,
    'initialTotal',
  ]),
  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles'])),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

const dispatchToProps = (dispatch: ActionCreator<Action>) => ({ dispatch });

const DetailPageContainer = connect(
  mapStateToProps,
  dispatchToProps
)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: (id) => [
    fetchAuthor(id),
    newSearch(AUTHOR_PUBLICATIONS_NS),
    newSearch(AUTHOR_CITATIONS_NS),
    newSearch(AUTHOR_DATA_NS),
    newSearch(AUTHOR_SEMINARS_NS),
    searchBaseQueriesUpdate(AUTHOR_SEMINARS_NS, {
      baseQuery: { q: `speakers.record.$ref:${id}` },
    }),
  ],
  loadingStateSelector: (state: RootStateOrAny) =>
    !state.authors.hasIn(['data', 'metadata']),
});
