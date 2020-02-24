import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { Map } from 'immutable';

import fetchJob from '../../actions/jobs';
import ContentBox from '../../common/components/ContentBox';
import RichDescription from '../../common/components/RichDescription';
import DateFromNow from '../components/DateFromNow';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import EditRecordAction from '../../common/components/EditRecordAction';
import RegionsList from '../components/RegionsList';
import InstitutionsList from '../components/InstitutionsList';
import RanksList from '../components/RanksList';
import DeadlineDate from '../components/DeadlineDate';
import ContactList from '../../common/components/ContactList';
import ReferenceLettersContacts from '../components/ReferenceLettersContacts';
import MoreInfo from '../components/MoreInfo';
import DocumentHead from '../../common/components/DocumentHead';
import JobTitle from '../components/JobTitle';
import {
  InlineUL,
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';
import JobStatusAlert from '../components/JobStatusAlert';
import DeletedAlert from '../../common/components/DeletedAlert';
import { makeCompliantMetaDescription } from '../../common/utils';
import withRouteDataFetcher from '../../common/withRouteDataFetcher';

function DetailPage({ record }) {
  const metadata = record.get('metadata');
  const created = record.get('created');
  const updated = record.get('updated');
  const position = metadata.get('position');
  const institutions = metadata.get('institutions');
  const regions = metadata.get('regions');
  const arxivCategories = metadata.get('arxiv_categories');
  const ranks = metadata.get('ranks');
  const experiments = metadata.get('accelerator_experiments');
  const deadlineDate = metadata.get('deadline_date');
  const description = metadata.get('description');
  const status = metadata.get('status');
  const contacts = metadata.get('contact_details');
  const referenceLetters = metadata.get('reference_letters');
  const urls = metadata.get('urls');
  const canEdit = metadata.get('can_edit', false);
  const externalJobId = metadata.get('external_job_identifier');
  const deleted = metadata.get('deleted', false);

  const metaDescription = makeCompliantMetaDescription(description);

  return (
    <>
      <DocumentHead title={position} description={metaDescription} />
      <Row type="flex" justify="center">
        <Col className="mv3" xs={24} md={21} lg={19} xl={18}>
          <ContentBox
            leftActions={
              canEdit && (
                <EditRecordAction pidType="jobs" pidValue={this.recordId} />
              )
            }
          >
            <Row>
              <Col>{deleted && <DeletedAlert />}</Col>
            </Row>
            <Row>
              <Col>
                <JobStatusAlert status={status} />
              </Col>
            </Row>
            <Row>
              <Col>
                <h2>
                  <JobTitle position={position} externalJobId={externalJobId} />
                </h2>
              </Col>
            </Row>
            <Row className="mt1">
              <Col>
                <InlineUL separator={SEPARATOR_MIDDLEDOT}>
                  {institutions && (
                    <InstitutionsList institutions={institutions} />
                  )}
                  <RegionsList regions={regions} />
                </InlineUL>
              </Col>
            </Row>
            <Row className="mt2">
              <Col>
                <ArxivCategoryList
                  arxivCategories={arxivCategories}
                  wrapperClassName="di"
                />
                <InlineUL separator={SEPARATOR_MIDDLEDOT} wrapperClassName="di">
                  {ranks && <RanksList ranks={ranks} />}
                  {experiments && <ExperimentList experiments={experiments} />}
                </InlineUL>
              </Col>
            </Row>
            <Row className="mt3">
              <Col>
                <DeadlineDate deadlineDate={deadlineDate} />
              </Col>
            </Row>
            <Row className="mt4">
              <Col>
                <strong>Job description:</strong>
                <RichDescription>{description}</RichDescription>
              </Col>
            </Row>
            <Row className="mt4">
              <Col>
                <ContactList contacts={contacts} />
                <ReferenceLettersContacts referenceLetters={referenceLetters} />
                <MoreInfo urls={urls} />
              </Col>
            </Row>
            <Row type="flex" justify="end">
              <Col>
                Posted <DateFromNow date={created} />, updated{' '}
                <DateFromNow date={updated} />
              </Col>
            </Row>
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
  loading: state.jobs.get('loading'),
  record: state.jobs.get('data'),
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteDataFetcher(DetailPageContainer, {
  routeParamsToFetchActions: ({ id }) => [fetchJob(id)],
  stateToLoading: state => !state.jobs.hasIn(['data', 'metadata']),
});
