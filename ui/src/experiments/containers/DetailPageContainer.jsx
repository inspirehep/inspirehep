import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import fetchExperiment from '../../actions/experiments';
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import ContentBox from '../../common/components/ContentBox';
import DocumentHead from '../../common/components/DocumentHead';
import AffiliationList from '../../common/components/AffiliationList';
import { SEPARATOR_MIDDLEDOT } from '../../common/components/InlineList';
import RelatedRecordsList from '../../common/components/RelatedRecordsList';
import RequireOneOf from '../../common/components/RequireOneOf';
import RichDescription from '../../common/components/RichDescription';
import DeletedAlert from '../../common/components/DeletedAlert';
import UrlsAction from '../../literature/components/UrlsAction';
import ExperimentDates from '../components/ExperimentDates';
import ExperimentCollaboration from '../components/ExperimentCollaboration';
import ExperimentAssociatedArticlesLink from '../components/ExperimentAssociatedArticlesLink';
import ExperimentCollaborationMembersLink from '../components/ExperimentCollaborationMembersLink';
import ExperimentCollaborationArticlesLink from '../components/ExperimentCollaborationArticlesLink';
import PublicNotesList from '../../common/components/PublicNotesList';
import { newSearch } from '../../actions/search';
import ExperimentPapers from './ExperimentPapers';
import { makeCompliantMetaDescription } from '../../common/utils';
import { EXPERIMENT_PAPERS_NS } from '../../search/constants';
import { EXPERIMENTS_PID_TYPE } from '../../common/constants';

function DetailPage({ record }) {
  const metadata = record.get('metadata');

  const legacyName = metadata.get('legacy_name');
  const institutions = metadata.get('institutions');
  const longName = metadata.get('long_name');
  const parentExperiments = metadata.get('parent_experiments');
  const successorExperiments = metadata.get('successor_experiments');
  const predecessorExperiments = metadata.get('predecessor_experiments');
  const subsidiaryExperiments = metadata.get('subsidiary_experiments');
  const description = metadata.get('description');
  const deleted = metadata.get('deleted', false);
  const urls = metadata.get('urls');
  const dateStarted = metadata.get('date_started');
  const dateProposed = metadata.get('date_proposed');
  const dateApproved = metadata.get('date_approved');
  const dateCancelled = metadata.get('date_cancelled');
  const dateCompleted = metadata.get('date_completed');
  const collaboration = metadata.get('collaboration');
  const recordId = metadata.get('control_number');
  const publicNotes = metadata.get('public_notes');

  return (
    <>
      <DocumentHead
        title={legacyName}
        description={makeCompliantMetaDescription(description)}
      />
      <Row justify="center">
        <Col className="mv3" xs={24} md={22} lg={21} xxl={18}>
          <ContentBox
            className="sm-pb3"
            leftActions={urls && <UrlsAction urls={urls} text="links" />}
          >
            <Row>
              <Col span={24}>{deleted && <DeletedAlert />}</Col>
            </Row>
            <Row>
              <Col>
                <h2>
                  {legacyName}
                  {institutions && (
                    <span className="pl1 f6">
                      (
                      <AffiliationList
                        affiliations={institutions}
                        separator={SEPARATOR_MIDDLEDOT}
                      />
                      )
                    </span>
                  )}
                </h2>
              </Col>
            </Row>
            {longName && (
              <Row>
                <Col>{longName}</Col>
              </Row>
            )}
            <RequireOneOf
              dependencies={[
                dateApproved,
                dateProposed,
                dateStarted,
                dateCancelled,
                dateCompleted,
              ]}
            >
              <Row>
                <Col>
                  (<ExperimentDates
                    dateApproved={dateApproved}
                    dateProposed={dateProposed}
                    dateStarted={dateStarted}
                    dateCancelled={dateCancelled}
                    dateCompleted={dateCompleted}
                    wrapperClassName="di"
                  />)
                </Col>
              </Row>
            </RequireOneOf>
            <RequireOneOf
              dependencies={[
                parentExperiments,
                successorExperiments,
                predecessorExperiments,
                subsidiaryExperiments,
              ]}
            >
              <Row className="mt3">
                <Col>
                  <RelatedRecordsList
                    relatedRecords={parentExperiments}
                    relationType="Parent"
                    label="Experiment"
                    pidType={EXPERIMENTS_PID_TYPE}
                  />
                  <RelatedRecordsList
                    relatedRecords={subsidiaryExperiments}
                    relationType="Subsidiary"
                    label="Experiment"
                    pidType={EXPERIMENTS_PID_TYPE}
                  />
                  <RelatedRecordsList
                    relatedRecords={successorExperiments}
                    relationType="Successor"
                    label="Experiment"
                    pidType={EXPERIMENTS_PID_TYPE}
                  />
                  <RelatedRecordsList
                    relatedRecords={predecessorExperiments}
                    relationType="Predecessor"
                    label="Experiment"
                    pidType={EXPERIMENTS_PID_TYPE}
                  />
                </Col>
              </Row>
            </RequireOneOf>
            {collaboration && (
              <Row>
                <Col>
                  <ExperimentCollaboration collaboration={collaboration} />
                </Col>
              </Row>
            )}
            {description && (
              <Row className="mt3">
                <Col>
                  <RichDescription>{description}</RichDescription>
                </Col>
              </Row>
            )}
            <Row className="mt3">
              <Col>
                <ExperimentAssociatedArticlesLink
                  recordId={recordId}
                  legacyName={legacyName}
                />
              </Col>
            </Row>
            {collaboration && (
              <Row>
                <Col>
                  <ExperimentCollaborationArticlesLink
                    collaboration={collaboration}
                  />
                </Col>
              </Row>
            )}
            <Row>
              <Col>
                <ExperimentCollaborationMembersLink recordId={recordId} />
              </Col>
            </Row>
            {publicNotes && (
              <Row className="mt2">
                <Col>
                  <PublicNotesList publicNotes={publicNotes} />
                </Col>
              </Row>
            )}
          </ContentBox>
        </Col>
      </Row>
      <Row justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <ContentBox>
            <ExperimentPapers recordId={recordId} />
          </ContentBox>
        </Col>
      </Row>
    </>
  );
}

DetailPage.propTypes = {
  record: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = state => ({
  record: state.experiments.get('data'),
});
const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({ id }) => id,
  routeActions: id => [fetchExperiment(id), newSearch(EXPERIMENT_PAPERS_NS)],
  loadingStateSelector: state => !state.experiments.hasIn(['data', 'metadata']),
});
