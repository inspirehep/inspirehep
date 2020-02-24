import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Alert } from 'antd';
import { Map, List } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import AuthorName from '../components/AuthorName';
import ExperimentList from '../../common/components/ExperimentList';
import { fetchAuthor } from '../../actions/authors';
import {
  fetchCitationSummary,
  fetchCitationsByYear,
} from '../../actions/citations';
import AuthorAffiliationList from '../../common/components/AuthorAffiliationList';
import {
  getCurrentAffiliationsFromPositions,
  getAuthorDisplayName,
  getAuthorMetaDescription,
} from '../utils';
import PositionsTimeline from '../components/PositionsTimeline';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import NumberOfCiteablePapersContainer from './NumberOfCiteablePapersContainer';
import NumberOfPublishedPapersContainer from './NumberOfPublishedPapersContainer';
import CitationsByYearGraphContainer from '../../common/containers/CitationsByYearGraphContainer';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import AuthorTwitterAction from '../components/AuthorTwitterAction';
import AuthorLinkedinAction from '../components/AuthorLinkedinAction';
import AuthorWebsitesAction from '../components/AuthorWebsitesAction';
import AuthorOrcid from '../components/AuthorOrcid';
import DocumentHead from '../../common/components/DocumentHead';
import AuthorEmailsAction from '../components/AuthorEmailsAction';
import AuthorPublicationsContainer from './AuthorPublicationsContainer';
import { AUTHOR_PUBLICATIONS_NS } from '../../reducers/search';
import { newSearch } from '../../actions/search';
import EmptyOrChildren from '../../common/components/EmptyOrChildren';
import EditRecordAction from '../../common/components/EditRecordAction';
import DeletedAlert from '../../common/components/DeletedAlert';
import UserSettingsAction from '../components/UserSettingsAction';
import withRouteDataFetcher from '../../common/withRouteDataFetcher';

function renderNumberOfCiteablePapers(value) {
  return (
    <NumberOfCiteablePapersContainer>{value}</NumberOfCiteablePapersContainer>
  );
}

function renderNumberOfPublishedPapers(value) {
  return (
    <NumberOfPublishedPapersContainer>{value}</NumberOfPublishedPapersContainer>
  );
}

function DetailPage({
  record,
  publicationsQuery,
  publications,
  userOrcid,
  loadingCitationSummary,
  dispatch,
}) {
  const authorFacetName = publicationsQuery.getIn(['author', 0]);
  const metadata = record.get('metadata');

  useEffect(
    () => {
      // check if author is fetched and author facet name is added to query of AUTHOR_PUBLICATIONS_NS.
      if (authorFacetName) {
        const query = publicationsQuery.toJS();
        // FIXME: localize dispatch(action) to relevant components, instead of dispatching in parent detail page
        dispatch(fetchCitationSummary(query));
        dispatch(fetchCitationsByYear(query));
      }
    },
    [dispatch, authorFacetName] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const name = metadata.get('name');
  const recordId = metadata.get('control_number');

  const positions = metadata.get('positions', List());
  const currentPositions = getCurrentAffiliationsFromPositions(positions);
  const shouldDisplayPositions = metadata.get('should_display_positions');

  const arxivCategories = metadata.get('arxiv_categories');
  const experiments = metadata.get('project_membership');

  const twitter = metadata.get('twitter');
  const linkedin = metadata.get('linkedin');
  const urls = metadata.get('urls');
  const orcid = metadata.get('orcid');
  const emails = metadata.get('email_addresses');
  const deleted = metadata.get('deleted', false);

  // TODO: maybe memoize (in other detail pages too) after "if (!metadata)" condition above is removed
  const metaDescription = getAuthorMetaDescription(metadata);
  return (
    <>
      <DocumentHead
        title={getAuthorDisplayName(name)}
        description={metaDescription}
      />
      <Row className="mv3" type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Alert
            type="info"
            showIcon
            message={
              <span>
                The author profile is currently under development. More features
                coming soon!
              </span>
            }
          />
          <Row
            className="mt3"
            type="flex"
            gutter={{ xs: 0, md: 16, xl: 32 }}
            justify="space-between"
          >
            <Col xs={24} md={12} lg={16}>
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
                  <Col>{deleted && <DeletedAlert />}</Col>
                </Row>
                <h2>
                  <AuthorName name={name} />
                  {currentPositions.size > 0 && (
                    <span className="pl1 f6">
                      (<AuthorAffiliationList affiliations={currentPositions} />)
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
                  </Col>
                  <Col xs={24} lg={12}>
                    {shouldDisplayPositions && (
                      <PositionsTimeline positions={positions} />
                    )}
                  </Col>
                </Row>
              </ContentBox>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <ContentBox loading={loadingCitationSummary}>
                <EmptyOrChildren data={publications} title="0 Research works">
                  <CitationSummaryTableContainer
                    renderNumberOfCiteablePapers={renderNumberOfCiteablePapers}
                    renderNumberOfPublishedPapers={
                      renderNumberOfPublishedPapers
                    }
                  />
                </EmptyOrChildren>
              </ContentBox>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row className="mb3" type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <ContentBox subTitle="Citation Summary">
            <EmptyOrChildren data={publications} title="0 Research works">
              <Row gutter={{ xs: 0, lg: 32 }}>
                <Col xs={24} md={24} lg={7}>
                  <CitationsByYearGraphContainer />
                </Col>
                <Col xs={24} md={24} lg={17}>
                  <CitationSummaryGraphContainer
                    namespace={AUTHOR_PUBLICATIONS_NS}
                  />
                </Col>
              </Row>
            </EmptyOrChildren>
          </ContentBox>
        </Col>
      </Row>
      <Row type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <ContentBox>
            <AuthorPublicationsContainer />
          </ContentBox>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  loadingCitationSummary: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  publicationsQuery: PropTypes.instanceOf(Map).isRequired,
  publications: PropTypes.instanceOf(List),
  userOrcid: PropTypes.string,
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
  loadingCitationSummary: state.citations.get('loadingCitationSummary'),
  userOrcid: state.user.getIn(['data', 'orcid']),
});
const dispatchToProps = dispatch => ({ dispatch });
const DetailPageContainer = connect(mapStateToProps, dispatchToProps)(
  DetailPage
);

export default withRouteDataFetcher(DetailPageContainer, {
  routeParamsToFetchActions: ({ id }) => [
    fetchAuthor(id),
    newSearch(AUTHOR_PUBLICATIONS_NS),
  ],
  stateToLoading: state => !state.authors.hasIn(['data', 'metadata']),
});
