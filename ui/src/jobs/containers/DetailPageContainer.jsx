import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Alert } from 'antd';
import { Map } from 'immutable';

import fetchJob from '../../actions/jobs';
import ContentBox from '../../common/components/ContentBox';
import Description from '../components/Description';
import DateFromNow from '../components/DateFromNow';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import ExperimentList from '../../common/components/ExperimentList';
import EditRecordAction from '../../common/components/EditRecordAction';
import RegionsList from '../components/RegionsList';
import InstitutionsList from '../components/InstitutionsList';
import RanksList from '../components/RanksList';
import InlineUL from '../../common/components/InlineList/InlineUL';
import DeadlineDate from '../components/DeadlineDate';
import ContactList from '../../common/components/ContactList';
import ReferenceLettersContacts from '../components/ReferenceLettersContacts';
import MoreInfo from '../components/MoreInfo';
import DocumentHead from '../../common/components/DocumentHead';
import JobTitle from '../components/JobTitle';

class DetailPage extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchJob(this.recordId));
  }

  componentDidUpdate(prevProps) {
    const { dispatch } = this.props;
    const prevRecordId = prevProps.match.params.id;
    if (this.recordId !== prevRecordId) {
      dispatch(fetchJob(this.recordId));
    }
  }

  get recordId() {
    const { match } = this.props;
    return match.params.id;
  }

  render() {
    const { record, loading } = this.props;
    const metadata = record.get('metadata');
    if (!metadata) {
      return null;
    }
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
    return (
      <>
        <DocumentHead title={position} />
        <Row type="flex" justify="center">
          <Col className="mv3" xs={24} md={21} lg={19} xl={18}>
            <ContentBox
              loading={loading}
              leftActions={
                canEdit && (
                  <EditRecordAction pidType="jobs" pidValue={this.recordId} />
                )
              }
            >
              {status === 'closed' && (
                <Row className="mb2">
                  <Col>
                    <Alert
                      type="error"
                      message={<span>This job is closed!</span>}
                      showIcon={false}
                    />
                  </Col>
                </Row>
              )}
              <Row>
                <Col>
                  <h2>
                    <JobTitle
                      position={position}
                      externalJobId={externalJobId}
                    />
                  </h2>
                </Col>
              </Row>
              <Row className="mt1">
                <Col>
                  <InlineUL separateItemsClassName="separate-items-with-middledot">
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
                  <InlineUL
                    separateItemsClassName="separate-items-with-middledot"
                    wrapperClassName="di"
                  >
                    {ranks && <RanksList ranks={ranks} />}
                    {experiments && (
                      <ExperimentList experiments={experiments} />
                    )}
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
                  <Description description={description} />
                </Col>
              </Row>
              <Row className="mt4">
                <Col>
                  <ContactList contacts={contacts} />
                  <ReferenceLettersContacts
                    referenceLetters={referenceLetters}
                  />
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
}

DetailPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  record: PropTypes.instanceOf(Map).isRequired,
  loading: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  loading: state.jobs.get('loading'),
  record: state.jobs.get('data'),
});
const dispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, dispatchToProps)(DetailPage);
