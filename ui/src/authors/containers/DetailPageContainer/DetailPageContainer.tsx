import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Tabs, Tooltip } from 'antd';
import { Map, List } from 'immutable';

import './DetailPage.scss';
import ContentBox from '../../../common/components/ContentBox';
import AuthorName from '../../components/AuthorName';
import ExperimentList from '../../../common/components/ExperimentList';
import fetchAuthor from '../../../actions/authors';
import { fetchCitationsByYear } from '../../../actions/citations';
import {
  getCurrentAffiliationsFromPositions,
  getAuthorDisplayName,
  getAuthorMetaDescription,
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
} from '../../../search/constants';
import { newSearch, searchBaseQueriesUpdate } from '../../../actions/search';
import DeletedAlert from '../../../common/components/DeletedAlert';
import UserSettingsAction from '../../components/UserSettingsAction';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import AuthorBAI from '../../components/AuthorBAI';
import Advisors from '../../components/Advisors';
import AffiliationList from '../../../common/components/AffiliationList';
import RecordUpdateInfo from '../../../common/components/RecordUpdateInfo';
import AuthorSeminars from '../../components/AuthorSeminars';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditAuthorRecordAction from '../../components/EditAuthorRecordAction.tsx';
import { isCataloger } from '../../../common/authorization';

function DetailPage({
  record,
  publicationsQuery,
  userOrcid,
  dispatch,
  publicationsCount,
  citingPapersCount,
  loadingPublications,
  seminarsCount,
  isCatalogerLoggedIn
}: any) {
  const authorFacetName = publicationsQuery.getIn(['author', 0]);
  const metadata = record.get('metadata');
  const updateTime = record.get('updated');
  useEffect(
    () => {
      // check if author is fetched and author facet name is added to query of AUTHOR_PUBLICATIONS_NS
      // by AuthorPublicationsContainer.
      if (authorFacetName) {
        const query = publicationsQuery.toJS();
        // FIXME: localize dispatch(action) to relevant components, instead of dispatching in parent detail page
        dispatch(fetchCitationsByYear(query));
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
  const linkedin = metadata.get('linkedin');
  const urls = metadata.get('urls');
  const orcid = metadata.get('orcid');
  const emails = metadata.get('email_addresses');
  const deleted = metadata.get('deleted', false);
  const bai = metadata.get('bai');
  const advisors = metadata.get('advisors');
  const canEdit = metadata.get('can_edit', false);

  const metaDescription = useMemo(() => getAuthorMetaDescription(metadata), [
    metadata,
  ]);
  return (
    <>
      <DocumentHead
        // @ts-ignore
        title={getAuthorDisplayName(name)}
        description={metaDescription}
      />
      {/* @ts-ignore */}
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row
            className="mv3"
            // @ts-ignore
            type="flex"
            gutter={{ xs: 0, md: 16, xl: 32 }}
            justify="space-between"
          >
            <Col span={24}>
              <ContentBox
                // @ts-ignore
                className="sm-pb3"
                leftActions={
                  <>
                    {emails && <AuthorEmailsAction emails={emails} />}
                    {/* @ts-ignore */}
                    {twitter && <AuthorTwitterAction twitter={twitter} />}
                    {/* @ts-ignore */}
                    {linkedin && <AuthorLinkedinAction linkedin={linkedin} />}
                    {urls && <AuthorWebsitesAction websites={urls} />}
                    {orcid && orcid === userOrcid && <UserSettingsAction />}
                    <EditAuthorRecordAction
                      canEdit={canEdit}
                      pidValue={recordId}
                      isCatalogerLoggedIn={isCatalogerLoggedIn}
                    />
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
                  {/* @ts-ignore */}
                  <AuthorName name={name} />
                  {currentPositions.size > 0 && (
                    <span className="pl1 f6">
                      {/* @ts-ignore */}
                      (<AffiliationList affiliations={currentPositions} />)
                    </span>
                  )}
                  {orcid && (
                    <span className="pl1">
                      {/* @ts-ignore */}
                      <AuthorOrcid orcid={orcid} />
                    </span>
                  )}
                </h2>
                {/* @ts-ignore */}
                <Row type="flex" justify="space-between">
                  <Col xs={24} lg={12} className="mb3">
                    {/* @ts-ignore */}
                    <ArxivCategoryList arxivCategories={arxivCategories} />
                    {/* @ts-ignore */}
                    <ExperimentList experiments={experiments} />
                    {bai && <AuthorBAI bai={bai} />}
                    {advisors && (
                      <div className="mt2">
                        {/* @ts-ignore */}
                        <Advisors advisors={advisors} />
                      </div>
                    )}
                  </Col>
                  <Col xs={24} lg={12}>
                    {shouldDisplayPositions && (
                      // @ts-expect-error ts-migrate(2322) FIXME: Type '{ positions: any; }' is not assignable to ty... Remove this comment to see the full error message
                      <PositionsTimeline positions={positions} />
                    )}
                  </Col>
                </Row>
              </ContentBox>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Tabs type="card" tabBarStyle={{ marginBottom: 0 }}>
                <Tabs.TabPane
                  tab={
                    <Tooltip title="Research from the author">
                      <span>
                        <TabNameWithCount
                          // @ts-ignore *
                          loading={
                            publicationsCount === null && loadingPublications
                          }
                          name="Research works"
                          count={publicationsCount}
                        />
                      </span>
                    </Tooltip>
                  }
                  key="1"
                >
                  {/* @ts-ignore */}
                  <ContentBox className="remove-top-border-of-card">
                    <AuthorPublicationsContainer />
                  </ContentBox>
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <Tooltip title="Research citing the author">
                      <span>
                        Cited By {citingPapersCount === 0 && <span> (0)</span>}
                      </span>
                    </Tooltip>
                  }
                  key="2"
                  forceRender
                >
                  {/* @ts-ignore */}
                  <ContentBox className="remove-top-border-of-card">
                    <AuthorCitationsContainer />
                  </ContentBox>
                </Tabs.TabPane>
                {seminarsCount > 0 && (
                  <Tabs.TabPane
                    tab={
                      <Tooltip title="Seminars from the author">
                        <span>Seminars</span>
                      </Tooltip>
                    }
                    key="3"
                  >
                    {/* @ts-ignore */}
                    <ContentBox className="remove-top-border-of-card">
                      <AuthorSeminars />
                    </ContentBox>
                  </Tabs.TabPane>
                )}
              </Tabs>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  record: PropTypes.instanceOf(Map).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  publicationsQuery: PropTypes.instanceOf(Map).isRequired,
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  publications: PropTypes.instanceOf(List),
  userOrcid: PropTypes.string,
  publicationsCount: PropTypes.number,
  citingPapersCount: PropTypes.number,
  isCatalogerLoggedIn: PropTypes.bool,
};

const mapStateToProps = (state: any) => ({
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

  citingPapersCount: state.search.getIn([
    'namespaces',
    AUTHOR_CITATIONS_NS,
    'initialTotal',
  ]),

  seminarsCount: state.search.getIn([
    'namespaces',
    AUTHOR_SEMINARS_NS,
    'initialTotal',
  ]),

  isCatalogerLoggedIn: isCataloger(state.user.getIn(['data', 'roles']))
});
const dispatchToProps = (dispatch: any) => ({
  dispatch
});
const DetailPageContainer = connect(
  mapStateToProps,
  dispatchToProps
)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({
    id
  }: any) => id,
  routeActions: (id: any) => [
    fetchAuthor(id),
    newSearch(AUTHOR_PUBLICATIONS_NS),
    newSearch(AUTHOR_CITATIONS_NS),
    newSearch(AUTHOR_SEMINARS_NS),
    searchBaseQueriesUpdate(AUTHOR_SEMINARS_NS, {
      baseQuery: { q: `speakers.record.$ref:${id}` },
    }),
  ],
  loadingStateSelector: (state: any) => !state.authors.hasIn(['data', 'metadata']),
});
