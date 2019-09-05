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
import ArxivPdfDownloadAction from '../../components/ArxivPdfDownloadAction';
import EditRecordAction from '../../../common/components/EditRecordAction';
import DOIList from '../../components/DOIList';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import ExternalSystemIdentifierList from '../../components/ExternalSystemIdentifierList';
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
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import CiteModalActionContainer from '../CiteModalActionContainer';
import PublicNotesList from '../../components/PublicNotesList';
import DocumentHead from '../../../common/components/DocumentHead';

class DetailPage extends Component {
  componentDidMount() {
    this.dispatchFetchActions();
  }

  componentDidUpdate(prevProps) {
    const prevRecordId = prevProps.match.params.id;
    if (this.recordId !== prevRecordId) {
      this.dispatchFetchActions();
      window.scrollTo(0, 0);
    }
  }

  get recordId() {
    const { match } = this.props;
    return match.params.id;
  }

  dispatchFetchActions() {
    const { dispatch } = this.props;
    dispatch(fetchLiterature(this.recordId));
    dispatch(fetchLiteratureReferences(this.recordId));
    dispatch(fetchLiteratureAuthors(this.recordId));
  }

  render() {
    const {
      authors,
      references,
      loadingReferences,
      errorReferences,
      citationCount,
      loadingCitations,
      record,
      loading,
    } = this.props;

    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }

    const title = metadata.getIn(['titles', 0]);
    const date = metadata.get('date');
    const recordId = metadata.get('control_number');
    const thesisInfo = metadata.get('thesis_info');
    const isbns = metadata.get('isbns');
    const publicationInfo = metadata.get('publication_info');
    const conferenceInfo = metadata.get('conference_info');
    const eprints = metadata.get('arxiv_eprints');
    const publicNotes = metadata.get('public_notes');
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

    const numberOfReferences = metadata.get('number_of_references', 0);
    const canEdit = metadata.get('can_edit', false);

    return (
      <>
        <DocumentHead title={title.get('title')} />
        <Row className="__DetailPage__" type="flex" justify="center">
          <Col className="mv3" xs={24} md={21} lg={16} xl={15} xxl={14}>
            <ContentBox
              loading={loading}
              leftActions={
                <Fragment>
                  {arxivId && <ArxivPdfDownloadAction arxivId={arxivId} />}
                  <CiteModalActionContainer recordId={recordId} />
                  {canEdit && (
                    <EditRecordAction
                      pidType="literature"
                      pidValue={recordId}
                    />
                  )}
                </Fragment>
              }
            >
              <h2>
                <LiteratureTitle title={title} />
              </h2>
              <div>
                <AuthorsAndCollaborations
                  authorCount={authorCount}
                  authors={authors}
                  enableAuthorsShowAll
                  collaborations={collaborations}
                  collaborationsWithSuffix={collaborationsWithSuffix}
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
              {publicNotes && (
                <Row>
                  <div className="mt3">
                    <PublicNotesList publicNotes={publicNotes} />
                  </div>
                </Row>
              )}
              <Row>
                <div className="mt3">
                  <LiteratureKeywordList keywords={keywords} />
                </div>
              </Row>
            </ContentBox>
          </Col>
          <Col className="mt3 mb3" xs={24} md={21} lg={16} xl={15} xxl={14}>
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
                <CitationListContainer
                  pidType="literature"
                  recordId={recordId}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab="Figures" key="3">
                <ContentBox>
                  This feature is currently under development.
                </ContentBox>
              </Tabs.TabPane>
            </Tabs>
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
  references: PropTypes.instanceOf(List).isRequired,
  errorReferences: ErrorPropType,
  authors: PropTypes.instanceOf(List).isRequired,
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
  citationCount: state.citations.get('total'),
  loadingCitations: state.citations.get('loading'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
