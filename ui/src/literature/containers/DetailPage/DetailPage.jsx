import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Tabs } from 'antd';
import { Map, List } from 'immutable';

import './DetailPage.scss';
import {
  fetchLiterature,
  fetchLiteratureReferences,
  fetchLiteratureAuthors,
} from '../../../actions/literature';
import Abstract from '../../components/Abstract';
import ArxivEprintList from '../../components/ArxivEprintList';
import AuthorList from '../../../common/components/AuthorList';
import ArxivPdfDownloadAction from '../../components/ArxivPdfDownloadAction';
import CiteModalAction from '../../components/CiteModalAction';
import EditRecordActionContainer from '../../../common/containers/EditRecordActionContainer';
import DOIList from '../../components/DOIList';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import ExternalSystemIdentifierList from '../../components/ExternalSystemIdentifierList';
import Latex from '../../../common/components/Latex';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureDate from '../../components/LiteratureDate';
import LiteratureKeywordList from '../../components/LiteratureKeywordList';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import ReferenceList from '../../components/ReferenceList';
import ReportNumberList from '../../components/ReportNumberList';
import ThesisInfo from '../../components/ThesisInfo';
import IsbnList from '../../components/IsbnList';
import ConferenceInfoList from '../../components/ConferenceInfoList';
import NumberOfPages from '../../components/NumberOfPages';
import CitationListContainer from '../../../common/containers/CitationListContainer';
import TabNameWithCount from '../../../common/components/TabNameWithCount';
import AcceleratorExperimentList from '../../components/AcceleratorExperimentList';
import { ErrorPropType } from '../../../common/propTypes';

class DetailPage extends Component {
  componentDidMount() {
    this.dispatchFetchActions();
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = prevProps.match.params.id;
    const recordId = this.props.match.params.id;
    if (recordId !== prevRecordId) {
      this.dispatchFetchActions();
      window.scrollTo(0, 0);
    }
  }

  dispatchFetchActions() {
    const recordId = this.props.match.params.id;
    this.props.dispatch(fetchLiterature(recordId));
    this.props.dispatch(fetchLiteratureReferences(recordId));
    this.props.dispatch(fetchLiteratureAuthors(recordId));
  }

  render() {
    const {
      authors,
      references,
      loadingReferences,
      errorReferences,
      supervisors,
      citationCount,
      loadingCitations,
    } = this.props;

    const { record } = this.props;
    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }

    const title = metadata.getIn(['titles', 0, 'title']);
    const date = metadata.get('date');
    const recordId = metadata.get('control_number');
    const thesisInfo = metadata.get('thesis_info');
    const isbns = metadata.get('isbns');
    const publicationInfo = metadata.get('publication_info');
    const conferenceInfo = metadata.get('conference_info');
    const eprints = metadata.get('arxiv_eprints');
    const dois = metadata.get('dois');
    const reportNumbers = metadata.get('report_numbers');
    const numberOfPages = metadata.get('number_of_pages');
    const externalSystemIdentifiers = metadata.get(
      'external_system_identifiers'
    );
    const acceleratorExperiments = metadata.get('accelerator_experiments');
    const abstract = metadata.getIn(['abstracts', 0]);
    const arxivId = metadata.getIn(['arxiv_eprints', 0, 'value']);
    const collaborations = metadata.get('collaborations');
    const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');

    const keywords = metadata.get('keywords');
    const authorCount = metadata.get('author_count');

    const numberOfReferences = metadata.get('number_of_references');

    return (
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col className="mt3 mb3" span={14}>
          <ContentBox
            loading={this.props.loading}
            leftActions={
              <Fragment>
                {arxivId && <ArxivPdfDownloadAction arxivId={arxivId} />}
                <CiteModalAction recordId={recordId} />
                <EditRecordActionContainer recordId={recordId} />
              </Fragment>
            }
          >
            <h2>
              <Latex>{title}</Latex>
            </h2>
            <div>
              <AuthorsAndCollaborations
                authorCount={authorCount}
                recordId={recordId}
                authors={authors}
                enableAuthorsShowAll
                collaborations={collaborations}
                collaborationsWithSuffix={collaborationsWithSuffix}
              />
              <AuthorList
                recordId={recordId}
                authors={supervisors}
                forSupervisors
                enableShowAll
              />
            </div>
            <LiteratureDate date={date} />
            <div className="mt3">
              <NumberOfPages numberOfPages={numberOfPages} />
              <ThesisInfo thesisInfo={thesisInfo} />
              <PublicationInfoList publicationInfo={publicationInfo} />
              <ConferenceInfoList conferenceInfo={conferenceInfo} />
              <IsbnList isbns={isbns} />
              <ArxivEprintList eprints={eprints} />
              <DOIList dois={dois} />
              <ReportNumberList reportNumbers={reportNumbers} />
              <AcceleratorExperimentList
                acceleratorExperiments={acceleratorExperiments}
              />
              <ExternalSystemIdentifierList
                externalSystemIdentifiers={externalSystemIdentifiers}
              />
            </div>
            <Row>
              <div className="mt3">
                <Abstract abstract={abstract} />
              </div>
            </Row>
            <Row>
              <div className="mt3">
                <LiteratureKeywordList keywords={keywords} />
              </div>
            </Row>
          </ContentBox>
        </Col>
        <Col className="mt3 mb3" span={14}>
          <Tabs
            type="card"
            tabBarStyle={{ marginBottom: 0 }}
            className="remove-top-border-of-card-children"
          >
            <Tabs.TabPane
              tab={
                <TabNameWithCount
                  name="References"
                  count={numberOfReferences}
                />
              }
              key="1"
            >
              <ReferenceList
                error={errorReferences}
                references={references}
                loading={loadingReferences}
              />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <TabNameWithCount
                  name="Citations"
                  loading={loadingCitations}
                  count={citationCount}
                />
              }
              key="2"
              forceRender
            >
              <CitationListContainer pidType="literature" recordId={recordId} />
            </Tabs.TabPane>
          </Tabs>
        </Col>
      </Row>
    );
  }
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  references: PropTypes.instanceOf(List).isRequired,
  errorReferences: ErrorPropType, // eslint-disable-line react/require-default-props
  authors: PropTypes.instanceOf(List).isRequired,
  supervisors: PropTypes.instanceOf(List).isRequired,
  loadingReferences: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
  citationCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  loadingCitations: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.literature.get('loading'),
  record: state.literature.get('data'),
  references: state.literature.get('references'),
  loadingReferences: state.literature.get('loadingReferences'),
  errorReferences: state.literature.get('errorReferences'),
  authors: state.literature.get('authors'),
  supervisors: state.literature.get('supervisors'),
  citationCount: state.citations.get('total'),
  loadingCitations: state.citations.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
