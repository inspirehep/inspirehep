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
import { getCurrentAffiliationsFromPositions } from '../utils';
import PositionsTimeline from '../components/PositionsTimeline';
import CitationSummaryTableContainer from '../../common/containers/CitationSummaryTableContainer';
import AuthorPublicationsContainer from './AuthorPublicationsContainer';
import CitationSummaryGraphContainer from '../../common/containers/CitationSummaryGraphContainer';
import NumberOfCiteablePapersContainer from './NumberOfCiteablePapersContainer';
import NumberOfPublishedPapersContainer from './NumberOfPublishedPapersContainer';
import AuthorizedContainer from '../../common/containers/AuthorizedContainer';
import { SUPERUSER_OR_CATALOGER } from '../../common/authorization';
import CitationsByYearGraphContainer from '../../common/containers/CitationsByYearGraphContainer';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';

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
    this.dispatchFetchAuthorResources();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    const recordId = match.params.id;
    const prevRecordId = prevProps.match.params.id;
    if (recordId !== prevRecordId) {
      this.dispatchFetchAuthorResources();
      window.scrollTo(0, 0);
    }
  }

  async dispatchFetchAuthorResources() {
    const { match, dispatch } = this.props;
    const recordId = match.params.id;
    await dispatch(fetchAuthor(recordId));

    dispatch(fetchAuthorPublications());
    dispatch(fetchAuthorPublicationsFacets());

    dispatch(fetchCitationSummary());
    dispatch(fetchCitationsByYear());
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

    return (
      <>
        <Row className="mv3" type="flex" justify="center">
          <Col xs={24} md={21} lg={19} xl={18}>
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
                <ContentBox loading={loading} className="sm-pb3">
                  <Row type="flex" justify="space-between">
                    <Col xs={24} lg={12}>
                      <h2>
                        <AuthorName name={name} />
                        {currentPositions.size > 0 && (
                          <span className="pl1 f6">
                            (<AuthorAffiliationList
                              affiliations={currentPositions}
                            />)
                          </span>
                        )}
                      </h2>
                      <div className="mt1">
                        <ArxivCategoryList arxivCategories={arxivCategories} />
                        <ExperimentList experiments={experiments} />
                      </div>
                    </Col>
                    <Col xs={24} lg={12}>
                      <CitationsByYearGraphContainer />
                    </Col>
                  </Row>
                </ContentBox>
              </Col>
              {shouldDisplayPositions && (
                <Col xs={24} md={12} lg={8}>
                  <ContentBox loading={loading} subTitle="Positions">
                    <PositionsTimeline positions={positions} />
                  </ContentBox>
                </Col>
              )}
            </Row>
          </Col>
        </Row>
        <Row className="mb3" type="flex" justify="center">
          <Col xs={24} md={21} lg={19} xl={18}>
            <AuthorizedContainer authorizedRoles={SUPERUSER_OR_CATALOGER}>
              <ContentBox>
                <Row gutter={{ xs: 0, lg: 32 }}>
                  <Col xs={24} md={12} lg={7}>
                    <CitationSummaryTableContainer
                      renderNumberOfCiteablePapers={
                        DetailPage.renderNumberOfCiteablePapers
                      }
                      renderNumberOfPublishedPapers={
                        DetailPage.renderNumberOfPublishedPapers
                      }
                    />
                  </Col>
                  <Col xs={24} md={12} lg={17}>
                    <CitationSummaryGraphContainer />
                  </Col>
                </Row>
              </ContentBox>
            </AuthorizedContainer>
          </Col>
        </Row>
        <Row type="flex" justify="center">
          <Col xs={24} md={21} lg={19} xl={18}>
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
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.authors.get('loading'),
  record: state.authors.get('data'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
