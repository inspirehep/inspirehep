import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Alert } from 'antd';
import { Map, List } from 'immutable';

import ContentBox from '../../common/components/ContentBox';
import AuthorName from '../components/AuthorName';
import ExperimentList from '../components/ExperimentList';
import ArxivCategoryList from '../components/ArxivCategoryList';
import fetchAuthor, {
  fetchAuthorPulications,
  fetchAuthorPulicationsFacets,
} from '../../actions/authors';
import LiteratureItem from '../../literature/components/LiteratureItem';
import AuthorAffiliationList from '../../common/components/AuthorAffiliationList';
import { getCurrentAffiliationsFromPositions } from '../utils';
import PositionsTimeline from '../components/PositionsTimeline';
import SubContentBox from '../../common/components/SubContentBox';
import CitationSummaryContainer from './CitationSummaryContainer';
import AuthorPublicationsContainer from './AuthorPublicationsContainer';

class DetailPage extends Component {
  constructor(props) {
    super(props);

    this.authorLiteratureSearchQuery = Map({
      author: List(),
    });
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
    dispatch(fetchAuthorPulications());
    dispatch(fetchAuthorPulicationsFacets());
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

    const authorFacetName = metadata.get('facet_author_name');

    this.authorLiteratureSearchQuery = this.authorLiteratureSearchQuery.setIn(
      ['author', 0],
      authorFacetName
    );

    return (
      <Fragment>
        <Row type="flex" justify="center">
          <Col className="mv3" xs={24} md={21} lg={19} xl={18}>
            <ContentBox loading={loading}>
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
              <h2 className="mt3">
                <AuthorName name={name} />
                {currentPositions.size > 0 && (
                  <span className="pl1 f6">
                    (
                    <AuthorAffiliationList affiliations={currentPositions} />
                    )
                  </span>
                )}
              </h2>
              <div className="mt1">
                <ArxivCategoryList arxivCategories={arxivCategories} />
                <ExperimentList experiments={experiments} />
              </div>
              <div className="mt3">
                <Row gutter={20}>
                  {shouldDisplayPositions && (
                    <Col xs={24} md={12} lg={8} xl={7}>
                      <SubContentBox title="Positions">
                        <PositionsTimeline positions={positions} />
                      </SubContentBox>
                    </Col>
                  )}
                  <Col xs={24} md={12} lg={9} xl={8}>
                    <CitationSummaryContainer
                      searchQuery={this.authorLiteratureSearchQuery}
                    />
                  </Col>
                </Row>
              </div>
            </ContentBox>
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
      </Fragment>
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
