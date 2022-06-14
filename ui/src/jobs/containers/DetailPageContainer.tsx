import React from 'react';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { connect } from 'react-redux';
import { Row, Col } from 'antd';
import { Map } from 'immutable';

import fetchJob from '../../actions/jobs';
import ContentBox from '../../common/components/ContentBox';
import RichDescription from '../../common/components/RichDescription';
import DateFromNow from '../components/DateFromNow';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
// @ts-expect-error ts-migrate(2691) FIXME: An import path cannot end with a '.tsx' extension.... Remove this comment to see the full error message
import EditRecordAction from '../../common/components/EditRecordAction.tsx';
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
import withRouteActionsDispatcher from '../../common/withRouteActionsDispatcher';
import RequireOneOf from '../../common/components/RequireOneOf';

type DetailPageProps = {
    record: $TSFixMe; // TODO: PropTypes.instanceOf(Map)
};

function DetailPage({ record }: DetailPageProps) {
  const metadata = record.get('metadata');
  const created = record.get('created');
  const updated = record.get('updated');
  const position = metadata.get('position');
  const controlNumber = metadata.get('control_number');
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
      {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
      <Row type="flex" justify="center">
        <Col className="mt3" xs={24} md={21} lg={19} xl={18}>
          {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
          <ContentBox
            leftActions={
              canEdit && (
                <EditRecordAction pidType="jobs" pidValue={controlNumber} />
              )
            }
          >
            <Row>
              <Col span={24}>{deleted && <DeletedAlert />}</Col>
            </Row>
            <Row>
              <Col span={24}>
                {/* @ts-expect-error ts-migrate(2786) FIXME: 'JobStatusAlert' cannot be used as a JSX component... Remove this comment to see the full error message */}
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
            {/* @ts-expect-error ts-migrate(2786) FIXME: 'RequireOneOf' cannot be used as a JSX component. */}
            <RequireOneOf dependencies={[institutions, regions]}>
              <Row className="mt1">
                <Col>
                  {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
                  <InlineUL separator={SEPARATOR_MIDDLEDOT}>
                    {institutions && (
                      <InstitutionsList institutions={institutions} />
                    )}
                    <RegionsList regions={regions} />
                  </InlineUL>
                </Col>
              </Row>
            </RequireOneOf>
            {/* @ts-expect-error ts-migrate(2786) FIXME: 'RequireOneOf' cannot be used as a JSX component. */}
            <RequireOneOf dependencies={[arxivCategories, ranks, experiments]}>
              <Row className="mt2">
                <Col>
                  {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
                  <ArxivCategoryList
                    arxivCategories={arxivCategories}
                    wrapperClassName="di"
                  />
                  {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
                  <InlineUL
                    separator={SEPARATOR_MIDDLEDOT}
                    wrapperClassName="di"
                  >
                    {ranks && <RanksList ranks={ranks} />}
                    {experiments && (
                      <ExperimentList experiments={experiments} />
                    )}
                  </InlineUL>
                </Col>
              </Row>
            </RequireOneOf>
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
            {/* @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call. */}
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

const mapStateToProps = (state: $TSFixMe) => ({
  loading: state.jobs.get('loading'),
  record: state.jobs.get('data')
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({
    id
  }: $TSFixMe) => id,
  routeActions: (id: $TSFixMe) => [fetchJob(id)],
  loadingStateSelector: (state: $TSFixMe) => !state.jobs.hasIn(['data', 'metadata']),
});
