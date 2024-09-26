import React from 'react';
import { Row, Col, Card, Alert } from 'antd';
import { Map, List, fromJS } from 'immutable';
import { FilePdfOutlined, DatabaseOutlined } from '@ant-design/icons';

import './ReferenceDiffInterface.less';
import AuthorsAndCollaborations from '../../../common/components/AuthorsAndCollaborations';
import ContentBox from '../../../common/components/ContentBox';
import DeletedAlert from '../../../common/components/DeletedAlert';
import EditRecordAction from '../../../common/components/EditRecordAction';
import ExperimentList from '../../../common/components/ExperimentList';
import IncomingLiteratureReferencesLinkAction from '../../../common/components/IncomingLiteratureReferencesLinkAction';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import PublicationInfoList from '../../../common/components/PublicationInfoList';
import ReferenceSearchLinkAction from '../../../common/components/ReferenceSearchLinkAction';
import CiteModalActionContainer from '../../containers/CiteModalActionContainer';
import { getPapersQueryString } from '../../utils';
import ArxivEprintList from '../ArxivEprintList';
import BookSeriesInfoList from '../BookSeriesInfoList';
import ConferenceInfoList from '../ConferenceInfoList';
import DOIList from '../DOIList';
import ExternalSystemIdentifierList from '../ExternalSystemIdentifierList';
import ImprintInfo from '../ImprintInfo';
import IsbnList from '../IsbnList';
import LiteratureClaimButton from '../LiteratureClaimButton';
import LiteratureDate from '../LiteratureDate';
import NumberOfPages from '../NumberOfPages';
import ParentRecordInfo from '../ParentRecordInfo';
import { PDGKeywords } from '../PDGKeywords';
import PersistentIdentifiers from '../PersistentIdentifiers';
import ReportNumberList from '../ReportNumberList';
import SupervisorList from '../SupervisorList';
import ThesisInfo from '../ThesisInfo';
import UrlsAction from '../UrlsAction';
import DocumentHead from '../../../common/components/DocumentHead';
import ReferenceItem from '../ReferenceItem';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import ErrorAlertOrChildren from '../../../common/components/ErrorAlertOrChildren';

const META_DESCRIPTION = 'Self curation reference review';

const TITLE = 'Reference Curation';

function ReferenceDiffInterface({
  authors,
  record,
  supervisors,
  loggedIn,
  hasAuthorProfile,
  referenceId,
  previousReference,
  currentReference,
  loading,
  error,
}: {
  authors: List<any>;
  record: Map<string, any>;
  supervisors: List<any>;
  loggedIn: boolean;
  hasAuthorProfile: boolean;
  references: List<Map<string, any>>;
  referenceId: number;
  previousReference: Map<string, any>;
  currentReference: Map<string, any>;
  loading: boolean;
  error: Map<string, any> | undefined;
}) {
  const metadata = record.get('metadata');

  const title = metadata.getIn(['titles', 0]);
  const date = metadata.get('date');
  const controlNumber = metadata.get('control_number');
  const thesisInfo = metadata.get('thesis_info');
  const isbns = metadata.get('isbns');
  const imprint = metadata.get('imprints');
  const publicationInfo = metadata.get('publication_info');
  const conferenceInfo = metadata.get('conference_info');
  const documentType = metadata.get('document_type');
  const eprints = metadata.get('arxiv_eprints');
  const dois = metadata.get('dois');
  const reportNumbers = metadata.get('report_numbers');
  const numberOfPages = metadata.get('number_of_pages');
  const externalSystemIdentifiers = metadata.get('external_system_identifiers');
  const acceleratorExperiments = metadata.get('accelerator_experiments');
  const fullTextLinks = metadata.get('fulltext_links');
  const urls = metadata.get('urls');
  const collaborations = metadata.get('collaborations');
  const collaborationsWithSuffix = metadata.get('collaborations_with_suffix');
  const linkedBooks = metadata.get('linked_books');
  const bookSeries = metadata.get('book_series');
  const PDGkeywords = metadata.get('pdg_keywords');
  const authorCount = metadata.get('author_count');
  const citationCount = metadata.get('citation_count');
  const persistentIdentifiers = metadata.get('persistent_identifiers');

  const canEdit = metadata.get('can_edit', false);
  const deleted = metadata.get('deleted', false);
  const datasetLinks = metadata.get('dataset_links');

  const publicationInfoWithTitle = publicationInfo
    ? publicationInfo.filter((pub: Map<string, any>) =>
        pub.has('journal_title')
      )
    : null;

  const displayPreviousReference =
    previousReference &&
    previousReference?.get('control_number') &&
    previousReference?.getIn(['titles', 0]);

  return (
    <>
      <DocumentHead title={TITLE} description={META_DESCRIPTION} />
      <Row justify="center" className="__ReferenceDiffInterface__">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row
            className="mv3"
            justify="center"
            gutter={{ xs: 0, lg: 16, xl: 32 }}
          >
            <Col span={24}>
              <ContentBox
                className="md-pb3"
                leftActions={
                  <>
                    {fullTextLinks && (
                      <UrlsAction
                        urls={fullTextLinks}
                        text="pdf"
                        icon={<FilePdfOutlined />}
                        trackerEventId="Pdf download"
                        eventAction="Download"
                        page="Literature detail"
                      />
                    )}
                    {urls && (
                      <UrlsAction
                        urls={urls}
                        text="links"
                        trackerEventId="Literature file"
                        page="Literature detail"
                      />
                    )}
                    <CiteModalActionContainer
                      // @ts-expect-error
                      recordId={controlNumber}
                      // @ts-expect-error
                      page="Literature detail"
                    />
                    <LiteratureClaimButton
                      loggedIn={loggedIn}
                      hasAuthorProfile={hasAuthorProfile}
                      authors={authors}
                      controlNumber={controlNumber}
                      page="Literature detail"
                    />
                    {canEdit && (
                      <EditRecordAction
                        pidType="literature"
                        pidValue={controlNumber}
                        page="Literature detail"
                      />
                    )}
                    {datasetLinks && (
                      <UrlsAction
                        urls={datasetLinks}
                        icon={<DatabaseOutlined />}
                        text="datasets"
                        trackerEventId="Dataset links"
                        page="Literature detail"
                      />
                    )}
                  </>
                }
                rightActions={
                  <>
                    <ReferenceSearchLinkAction
                      recordId={controlNumber}
                      page="Literature detail"
                    />
                    {citationCount != null && (
                      <IncomingLiteratureReferencesLinkAction
                        linkQuery={getPapersQueryString(controlNumber)}
                        referenceType="citation"
                        itemCount={citationCount}
                        trackerEventId="Citations link"
                        eventCategory="Literature detail"
                      />
                    )}
                  </>
                }
              >
                <Row>
                  <Col span={24}>{deleted && <DeletedAlert />}</Col>
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
                    page="Literature detail"
                  />
                </div>
                <LiteratureDate date={date} />
                <div className="mt3">
                  <NumberOfPages numberOfPages={numberOfPages} />
                  <SupervisorList
                    supervisors={supervisors}
                    page="Literature detail"
                  />
                  <ThesisInfo thesisInfo={thesisInfo} />
                  {linkedBooks && (
                    <ParentRecordInfo
                      parentRecord={linkedBooks}
                    />
                  )}
                  {bookSeries && <BookSeriesInfoList bookSeries={bookSeries} />}
                  {publicationInfoWithTitle &&
                    publicationInfoWithTitle.size > 0 && (
                      <PublicationInfoList
                        publicationInfo={publicationInfoWithTitle}
                      />
                    )}
                  <ConferenceInfoList
                    conferenceInfo={conferenceInfo}
                    isProceedings={
                      documentType &&
                      documentType.toJS().includes('proceedings')
                    }
                  />
                  <IsbnList isbns={isbns} />
                  <ImprintInfo imprint={imprint} />
                  <ArxivEprintList page="Literature detail" eprints={eprints} />
                  <DOIList dois={dois} />
                  {persistentIdentifiers && persistentIdentifiers.size > 0 && (
                    <PersistentIdentifiers
                      identifiers={persistentIdentifiers}
                    />
                  )}
                  {PDGkeywords && PDGkeywords.size > 0 && (
                    <PDGKeywords keywords={PDGkeywords} />
                  )}
                  <ReportNumberList reportNumbers={reportNumbers} />
                  <ExperimentList experiments={acceleratorExperiments} />
                  <ExternalSystemIdentifierList
                    externalSystemIdentifiers={externalSystemIdentifiers}
                  />
                </div>
              </ContentBox>
            </Col>
          </Row>
          {error ? (
            <Row className="mb3">
              <Col span={24}>
                <Alert
                  message={error.get('message')}
                  type="error"
                  showIcon
                  closable
                />
              </Col>
            </Row>
          ) : (
            <>
              <Row>
                <Col className="mt3" span={24}>
                  <ContentBox loading={loading}>
                    <ErrorAlertOrChildren error={error}>
                      <EmptyOrChildren
                        data={currentReference}
                        title="0 References"
                      >
                        <>
                          {displayPreviousReference && (
                            <Card
                              size="small"
                              className="no-border"
                              title={`Reference ${referenceId} changed from`}
                            >
                              <ReferenceItem
                                key="reference-1"
                                reference={previousReference}
                                disableEdit
                              />
                            </Card>
                          )}
                          {currentReference && (
                            <Card
                              size="small"
                              className="no-border"
                              title={
                                displayPreviousReference
                                  ? 'to'
                                  : `Reference ${referenceId} changed to`
                              }
                            >
                              <ReferenceItem
                                key="reference-2"
                                reference={currentReference}
                                disableEdit
                              />
                            </Card>
                          )}
                        </>
                      </EmptyOrChildren>
                    </ErrorAlertOrChildren>
                  </ContentBox>
                </Col>
              </Row>
              <Row>
                <Col className="mt3" span={24}>
                  <ContentBox loading={loading}>
                    <ErrorAlertOrChildren error={error}>
                      <EmptyOrChildren
                        data={previousReference}
                        title="0 References"
                      >
                        <>
                          <Card
                            size="small"
                            className="no-border"
                            title="Reference metadata"
                          >
                            <ReferenceItem
                              key="reference-metadata"
                              reference={previousReference}
                              unlinked
                              disableEdit
                            />
                          </Card>
                          <Card size="small" className="no-border">
                            <p className="b mb0 mt4">
                              {previousReference?.get('raw_ref')}
                            </p>
                          </Card>
                        </>
                      </EmptyOrChildren>
                    </ErrorAlertOrChildren>
                  </ContentBox>
                </Col>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default ReferenceDiffInterface;
