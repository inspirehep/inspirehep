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
import EditRecordAction from '../../../common/components/EditRecordAction';
import DeletedAlert from '../../../common/components/DeletedAlert';
import UserSettingsAction from '../../components/UserSettingsAction';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';
import AuthorBAI from '../../components/AuthorBAI';
import Advisors from '../../components/Advisors';
import AffiliationList from '../../../common/components/AffiliationList';
import AuthorSeminars from '../../components/AuthorSeminars';

function DetailPage({
  record,
  publicationsQuery,
  userOrcid,
  dispatch,
  publicationsCount,
  citingPapersCount,
  loadingPublications,
  seminarsCount,
}) {
  const authorFacetName = publicationsQuery.getIn(['author', 0]);
  const metadata = record.get('metadata');

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

  const metaDescription = useMemo(() => getAuthorMetaDescription(metadata), [
    metadata,
  ]);
  return (
    <>
      <DocumentHead
        title={getAuthorDisplayName(name)}
        description={metaDescription}
      />
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row
            className="mv3"
            type="flex"
            gutter={{ xs: 0, md: 16, xl: 32 }}
            justify="space-between"
          >
            <Col span={24}>
              <ContentBox
                className="sm-pb3"
                leftActions={
                  <>
                    {emails && <AuthorEmailsAction emails={emails} />}
                    {twitter && <AuthorTwitterAction twitter={twitter} />}
                    {linkedin && <AuthorLinkedinAction linkedin={linkedin} />}
                    {urls && <AuthorWebsitesAction websites={urls} />}
                    <EditRecordAction pidType="authors" pidValue={recordId} />
                    {orcid && orcid === userOrcid && <UserSettingsAction />}
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
                <Row type="flex" justify="space-between">
                  <Col xs={24} lg={12} className="mb3">
                    <ArxivCategoryList arxivCategories={arxivCategories} />
                    <ExperimentList experiments={experiments} />
                    {bai && <AuthorBAI bai={bai} />}
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
              <Tabs type="card" tabBarStyle={{ marginBottom: 0 }}>
                <Tabs.TabPane
                  tab={
                    <Tooltip title="Research from the author">
                      <span>
                        <TabNameWithCount
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
  record: PropTypes.instanceOf(Map).isRequired,
  publicationsQuery: PropTypes.instanceOf(Map).isRequired,
  publications: PropTypes.instanceOf(List),
  userOrcid: PropTypes.string,
  publicationsCount: PropTypes.number,
  citingPapersCount: PropTypes.number,
};

const mapStateToProps = state => ({
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
});
const dispatchToProps = dispatch => ({ dispatch });
const DetailPageContainer = connect(mapStateToProps, dispatchToProps)(
  DetailPage
);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: id => [
    fetchAuthor(id),
    newSearch(AUTHOR_PUBLICATIONS_NS),
    newSearch(AUTHOR_CITATIONS_NS),
    newSearch(AUTHOR_SEMINARS_NS),
    searchBaseQueriesUpdate(AUTHOR_SEMINARS_NS, {
      baseQuery: { q: `speakers.record.$ref:${id}` },
    }),
  ],
  loadingStateSelector: state => !state.authors.hasIn(['data', 'metadata']),
});
