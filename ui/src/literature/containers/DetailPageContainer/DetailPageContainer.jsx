import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Tabs } from 'antd';
import { Map, List } from 'immutable';
import classNames from 'classnames';
import { LinkOutlined, FilePdfOutlined } from '@ant-design/icons';

import './DetailPage.scss';
import {
  fetchLiterature,
  fetchLiteratureAuthors,
  fetchLiteratureReferences,
} from '../../../actions/literature';
import Abstract from '../../components/Abstract';
import ArxivEprintList from '../../components/ArxivEprintList';
import EditRecordAction from '../../../common/components/EditRecordAction';
import DOIList from '../../components/DOIList';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import ExternalSystemIdentifierList from '../../components/ExternalSystemIdentifierList';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureDate from '../../components/LiteratureDate';
import KeywordList from '../../../common/components/KeywordList';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import ReportNumberList from '../../components/ReportNumberList';
import ThesisInfo from '../../components/ThesisInfo';
import IsbnList from '../../components/IsbnList';
import ConferenceInfoList from '../../components/ConferenceInfoList';
import NumberOfPages from '../../components/NumberOfPages';
import CitationListContainer from '../../../common/containers/CitationListContainer';
import TabNameWithCount from '../../../common/components/TabNameWithCount';
import AcceleratorExperimentList from '../../components/AcceleratorExperimentList';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import CiteModalActionContainer from '../CiteModalActionContainer';
import DocumentHead from '../../../common/components/DocumentHead';
import {
  fetchCitationsByYear,
  fetchCitations,
} from '../../../actions/citations';
import CitationsByYearGraphContainer from '../../../common/containers/CitationsByYearGraphContainer';
import Figures from '../../components/Figures';
import RequireOneOf from '../../../common/components/RequireOneOf';
import ReferenceListContainer from '../../../common/containers/ReferenceListContainer';
import PublicNotesList from '../../../common/components/PublicNotesList';
import UrlsAction from '../../components/UrlsAction';
import DeletedAlert from '../../../common/components/DeletedAlert';
import SupervisorList from '../../components/SupervisorList';
import { makeCompliantMetaDescription } from '../../../common/utils';
import withRouteActionsDispatcher from '../../../common/withRouteActionsDispatcher';

function DetailPage({
  authors,
  citationCount,
  loadingCitations,
  record,
  referencesCount,
  supervisors,
}) {
  const metadata = record.get('metadata');

  const title = metadata.getIn(['titles', 0]);
  const date = metadata.get('date');
  const controlNumber = metadata.get('control_number');
  const thesisInfo = metadata.get('thesis_info');
  const isbns = metadata.get('isbns');
  const publicationInfo = metadata.get('publication_info');
  const conferenceInfo = metadata.get('conference_info');
  const eprints = metadata.get('arxiv_eprints');
  const publicNotes = metadata.get('public_notes');
  const dois = metadata.get('dois');
  const reportNumbers = metadata.get('report_numbers');
  const numberOfPages = metadata.get('number_of_pages');
  const externalSystemIdentifiers = metadata.get('external_system_identifiers');
  const acceleratorExperiments = metadata.get('accelerator_experiments');
  const abstract = metadata.getIn(['abstracts', 0]);
  const fullTextLinks = metadata.get('fulltext_links');
  const urls = metadata.get('urls');
  const collaborations = metadata.get('collaborations');
  const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');

  const keywords = metadata.get('keywords');
  const authorCount = metadata.get('author_count');

  const canEdit = metadata.get('can_edit', false);
  const figures = metadata.get('figures');
  const deleted = metadata.get('deleted', false);

  const metaDescription = makeCompliantMetaDescription(
    abstract && abstract.get('value')
  );

  return (
    <>
      <DocumentHead title={title.get('title')} description={metaDescription} />
      <Row className="__DetailPage__" type="flex" justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row
            className="mv3"
            type="flex"
            justify="center"
            gutter={{ xs: 0, lg: 16, xl: 32 }}
          >
            <Col xs={24} lg={16}>
              <ContentBox
                className="md-pb3"
                leftActions={
                  <>
                    {fullTextLinks && (
                      <UrlsAction
                        urls={fullTextLinks}
                        iconText="pdf"
                        icon={<FilePdfOutlined />}
                        trackerEventId="PdfDownload"
                      />
                    )}
                    {urls && (
                      <UrlsAction
                        urls={urls}
                        iconText="links"
                        icon={<LinkOutlined />}
                        trackerEventId="LiteratureFileLink"
                      />
                    )}
                    <CiteModalActionContainer recordId={controlNumber} />
                    {canEdit && (
                      <EditRecordAction
                        pidType="literature"
                        pidValue={controlNumber}
                      />
                    )}
                  </>
                }
              >
                <Row>
                  <Col>{deleted && <DeletedAlert />}</Col>
                </Row>
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
                  <SupervisorList supervisors={supervisors} />
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
              </ContentBox>
            </Col>
            <Col xs={24} lg={8}>
              <ContentBox subTitle="Citations per year">
                <CitationsByYearGraphContainer />
              </ContentBox>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <RequireOneOf dependencies={[abstract, publicNotes, keywords]}>
                <ContentBox>
                  <div>
                    <Abstract abstract={abstract} />
                  </div>
                  <div
                    className={classNames({
                      mt3: publicNotes,
                      mb3: keywords,
                    })}
                  >
                    <PublicNotesList publicNotes={publicNotes} />
                  </div>
                  <div>
                    <KeywordList keywords={keywords} />
                  </div>
                </ContentBox>
              </RequireOneOf>
            </Col>
          </Row>
          <Row>
            <Col className="mt3 mb3" span={24}>
              <Tabs
                type="card"
                tabBarStyle={{ marginBottom: 0 }}
                className="remove-top-border-of-card-children"
              >
                <Tabs.TabPane
                  tab={
                    <TabNameWithCount
                      name="References"
                      count={referencesCount}
                    />
                  }
                  key="1"
                >
                  <ReferenceListContainer recordId={controlNumber} />
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
                  <CitationListContainer recordId={controlNumber} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <TabNameWithCount
                      name="Figures"
                      count={figures ? figures.size : 0}
                    />
                  }
                  key="3"
                >
                  <ContentBox>
                    <Figures figures={figures} />
                  </ContentBox>
                </Tabs.TabPane>
              </Tabs>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  record: PropTypes.instanceOf(Map).isRequired,
  authors: PropTypes.instanceOf(List).isRequired,
  citationCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  referencesCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  loadingCitations: PropTypes.bool.isRequired,
  supervisors: PropTypes.instanceOf(List),
};

const mapStateToProps = state => ({
  record: state.literature.get('data'),
  authors: state.literature.get('authors'),
  supervisors: state.literature.get('supervisors'),
  citationCount: state.citations.get('total'),
  referencesCount: state.literature.get('totalReferences'),
  loadingCitations: state.citations.get('loading'),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: id => [
    fetchLiterature(id),
    fetchLiteratureReferences(id),
    fetchCitations(id),
    fetchLiteratureAuthors(id),
    fetchCitationsByYear({ q: `recid:${id}` }),
  ],
  loadingStateSelector: state => !state.literature.hasIn(['data', 'metadata']),
});
