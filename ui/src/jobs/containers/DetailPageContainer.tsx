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

function DetailPage({
  record
}: any) {
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
      {/* @ts-ignore */}
      <DocumentHead title={position} description={metaDescription} />
      {/* @ts-ignore */}
      <Row type="flex" justify="center">
        <Col className="mt3" xs={24} md={21} lg={19} xl={18}>
          <ContentBox
            /* @ts-ignore */
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
                {/* @ts-ignore */}
                <JobStatusAlert status={status} />
              </Col>
            </Row>
            <Row>
              <Col>
                <h2>
                  {/* @ts-ignore */}
                  <JobTitle position={position} externalJobId={externalJobId} />
                </h2>
              </Col>
            </Row>
            <RequireOneOf dependencies={[institutions, regions]}>
              <Row className="mt1">
                <Col>
                  {/* @ts-ignore */}
                  <InlineUL separator={SEPARATOR_MIDDLEDOT}>
                    {institutions && (
                      /* @ts-ignore */
                      <InstitutionsList institutions={institutions} />
                    )}
                    {/* @ts-ignore */}
                    <RegionsList regions={regions} />
                  </InlineUL>
                </Col>
              </Row>
            </RequireOneOf>
            <RequireOneOf dependencies={[arxivCategories, ranks, experiments]}>
              <Row className="mt2">
                <Col>
                  <ArxivCategoryList
                    /* @ts-ignore */
                    arxivCategories={arxivCategories}
                    wrapperClassName="di"
                  />
                  <InlineUL
                    /* @ts-ignore */
                    separator={SEPARATOR_MIDDLEDOT}
                    wrapperClassName="di"
                  >
                    {/* @ts-ignore */}
                    {ranks && <RanksList ranks={ranks} />}
                    {experiments && (
                      /* @ts-ignore */
                      <ExperimentList experiments={experiments} />
                    )}
                  </InlineUL>
                </Col>
              </Row>
            </RequireOneOf>
            <Row className="mt3">
              <Col>
                {/* @ts-ignore */}
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
                {/* @ts-ignore */}
                <ContactList contacts={contacts} />
                {/* @ts-ignore */}
                <ReferenceLettersContacts referenceLetters={referenceLetters} />
                {/* @ts-ignore */}
                <MoreInfo urls={urls} />
              </Col>
            </Row>
            {/* @ts-ignore */}
            <Row type="flex" justify="end">
              <Col>
                {/* @ts-ignore */}
                Posted <DateFromNow date={created} />, updated{' '}
                {/* @ts-ignore */}
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
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof Map' is not assignable to... Remove this comment to see the full error message
  record: PropTypes.instanceOf(Map).isRequired,
};

const mapStateToProps = (state: any) => ({
  loading: state.jobs.get('loading'),
  record: state.jobs.get('data')
});

const DetailPageContainer = connect(mapStateToProps)(DetailPage);

export default withRouteActionsDispatcher(DetailPageContainer, {
  routeParamSelector: ({
    id
  }: any) => id,
  routeActions: (id: any) => [fetchJob(id)],
  loadingStateSelector: (state: any) => !state.jobs.hasIn(['data', 'metadata']),
});
