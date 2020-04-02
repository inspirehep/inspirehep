import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Map } from 'immutable';
import { Row, Col } from 'antd';

import ResultItem from '../../common/components/ResultItem';
import DateFromNow from './DateFromNow';
import { JOBS } from '../../common/routes';
import DeadlineDate from './DeadlineDate';
import InstitutionsList from './InstitutionsList';
import RegionsList from './RegionsList';
import ArxivCategoryList from '../../common/components/ArxivCategoryList';
import RanksList from './RanksList';
import ExperimentList from '../../common/components/ExperimentList';
import EditRecordAction from '../../common/components/EditRecordAction';
import JobTitle from './JobTitle';
import {
  InlineUL,
  SEPARATOR_MIDDLEDOT,
} from '../../common/components/InlineList';

class JobItem extends Component {
  render() {
    const { metadata, created } = this.props;

    const recordId = metadata.get('control_number');
    const position = metadata.get('position');
    const institutions = metadata.get('institutions');
    const regions = metadata.get('regions');
    const deadlineDate = metadata.get('deadline_date');
    const arxivCategories = metadata.get('arxiv_categories');
    const ranks = metadata.get('ranks');
    const experiments = metadata.get('accelerator_experiments');
    const canEdit = metadata.get('can_edit', false);
    const externalJobId = metadata.get('external_job_identifier');
    return (
      <ResultItem
        leftActions={
          canEdit && <EditRecordAction pidType="jobs" pidValue={recordId} />
        }
      >
        <Row type="flex" align="middle">
          <Col>
            <Link className="result-item-title pr1" to={`${JOBS}/${recordId}`}>
              <JobTitle position={position} externalJobId={externalJobId} />
            </Link>
          </Col>
          <Col>
            (<InlineUL wrapperClassName="di" separator={SEPARATOR_MIDDLEDOT}>
              {institutions && <InstitutionsList institutions={institutions} />}
              <RegionsList regions={regions} />
            </InlineUL>)
          </Col>
        </Row>
        <Row className="mt2">
          <Col>
            <ArxivCategoryList
              arxivCategories={arxivCategories}
              wrapperClassName="di"
            />
            <InlineUL separator={SEPARATOR_MIDDLEDOT} wrapperClassName="di">
              {experiments && <ExperimentList experiments={experiments} />}
              {ranks && <RanksList ranks={ranks} />}
            </InlineUL>
          </Col>
        </Row>
        <Row className="mt3" type="flex" justify="space-between">
          <Col>
            <DeadlineDate deadlineDate={deadlineDate} />
          </Col>
          <Col>
            Posted <DateFromNow date={created} />
          </Col>
        </Row>
      </ResultItem>
    );
  }
}

JobItem.propTypes = {
  metadata: PropTypes.instanceOf(Map).isRequired,
  created: PropTypes.string.isRequired,
};

export default JobItem;
