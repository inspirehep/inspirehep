import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Alert } from 'antd';
import { Map, List } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import AuthorName from '../components/AuthorName';
import ExperimentList from '../../common/components/ExperimentList';
import {
  fetchAuthor,
  fetchAuthorPublications,
  fetchAuthorPublicationsFacets,
} from '../../actions/authors';
import {
  fetchCitationSummary,
  fetchCitationsByYear,
} from '../../actions/citations';
import LiteratureItem from '../../literature/components/LiteratureItem';
import AuthorAffiliationList from '../../common/components/AuthorAffiliationList';
import {
  getCurrentAffiliationsFromPositions,
  getAuthorDisplayName,
} from '../utils';
import PositionsTimeline from '../components/PositionsTimeline';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';
import AuthorPublicationsContainer from './AuthorPublicationsContainer';
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

class DetailPage extends Component {
  static renderNumberOfCiteablePapers(value) {
    return (
      <NumberOfCiteablePapersContainer>{value}</NumberOfCiteablePapersContainer>
    );
  }

  static renderNumberOfPublishedPapers(value) {
    return (
      <NumberOfPublishedPapersContainer>
        {value}
      </NumberOfPublishedPapersContainer>
    );
  }

  componentDidMount() {
    this.dispatchFetchAuthor();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const recordId = match.params.id;
    const prevRecordId = prevProps.match.params.id;

    if (recordId !== prevRecordId) {
      this.dispatchFetchAuthor();
      window.scrollTo(0, 0);
    }

    const { record } = this.props;
    const prevRecord = prevProps.record;

    // check is not empty, because author is set to empty while loading the new one.
    if (!record.isEmpty() && record !== prevRecord) {
      this.dispatchAuthorPublicationsAndCitations();
    }
  }

  dispatchFetchAuthor() {
    const { match, dispatch } = this.props;
    const recordId = match.params.id;
    dispatch(fetchAuthor(recordId));
  }

  dispatchAuthorPublicationsAndCitations() {
    const { dispatch, publicationsQuery } = this.props;

    dispatch(fetchAuthorPublications());
    dispatch(fetchAuthorPublicationsFacets());

    const query = publicationsQuery.toJS();
    dispatch(fetchCitationSummary(query));
    dispatch(fetchCitationsByYear(query));
  }

  render() {
    const { record, loading } = this.props;

    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }

    const name = metadata.get('name');

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

    return (
      <>
        <DocumentHead title={getAuthorDisplayName(name)} />
        <Row className="mv3" type="flex" justify="center">
          <Col xs={24} md={22} lg={21} xxl={18}>
            <Alert
              type="info"
              showIcon
              message={
                <span>
                  The author profile is currently under development. More
                  features coming soon!
                </span>
              }
            />
            <Row
              className="mt3"
              type="flex"
              gutter={{ xs: 0, md: 16, lg: 32 }}
              justify="space-between"
            >
              <Col xs={24} md={12} lg={16}>
                <ContentBox
                  loading={loading}
                  className="sm-pb3"
                  leftActions={
                    <>
                      {emails && <AuthorEmailsAction emails={emails} />}
                      {twitter && <AuthorTwitterAction twitter={twitter} />}
                      {linkedin && <AuthorLinkedinAction linkedin={linkedin} />}
                      {urls && <AuthorWebsitesAction websites={urls} />}
                    </>
                  }
                >
                  <h2>
                    <AuthorName name={name} />
                    {currentPositions.size > 0 && (
                      <span className="pl1 f6">
                        (<AuthorAffiliationList
                          affiliations={currentPositions}
                        />)
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
                <ContentBox loading={loading}>
                  <CitationSummaryTableContainer
                    renderNumberOfCiteablePapers={
                      DetailPage.renderNumberOfCiteablePapers
                    }
                    renderNumberOfPublishedPapers={
                      DetailPage.renderNumberOfPublishedPapers
                    }
                  />
                </ContentBox>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className="mb3" type="flex" justify="center">
          <Col xs={24} md={22} lg={21} xxl={18}>
            <ContentBox subTitle="Citation Summary">
              <Row gutter={{ xs: 0, lg: 32 }}>
                <Col xs={24} md={24} lg={7}>
                  <CitationsByYearGraphContainer />
                </Col>
                <Col xs={24} md={24} lg={17}>
                  <CitationSummaryGraphContainer />
                </Col>
              </Row>
            </ContentBox>
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col xs={24} md={22} lg={21} xxl={18}>
            <ContentBox>
              <AuthorPublicationsContainer
                renderResultItem={(result, rank) => (
                  <LiteratureItem
                    metadata={result.get('metadata')}
                    searchRank={rank}
                  />
                )}
              />
            </ContentBox>
          </Col>
        </Row>
      </>
    );
  }
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  publicationsQuery: PropTypes.instanceOf(Map).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.authors.get('loading'),
  record: state.authors.get('data'),
  publicationsQuery: state.authors.getIn(['publications', 'query']),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
