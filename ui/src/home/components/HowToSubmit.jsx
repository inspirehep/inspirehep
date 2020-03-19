import React from 'react';
import { Row, Col } from 'antd';

import {
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS_JOB,
  SUBMISSIONS_CONFERENCE,
} from '../../common/routes';
import SubmissionCard from './SubmissionCard';

const GUTTER = [{ xs: 0, md: 32, xl: 64 }, { xs: 16, md: 16, lg: 0 }];

function HowToSubmit() {
  return (
    <Row justify="center" gutter={GUTTER}>
      <Col xs={24} md={12} lg={6}>
        <SubmissionCard title="Literature" formLink={SUBMISSIONS_LITERATURE}>
          <p>Suggest missing articles.</p>
          <p>All submissions will be visible upon approval.</p>
        </SubmissionCard>
      </Col>
      <Col xs={24} md={12} lg={6}>
        <SubmissionCard title="Author" formLink={SUBMISSIONS_AUTHOR}>
          <p>Create the profile of a new author.</p>
          <p>All submissions will be visible upon approval.</p>
        </SubmissionCard>
      </Col>
      <Col xs={24} md={12} lg={6}>
        <SubmissionCard title="Job" formLink={SUBMISSIONS_JOB}>
          <p>Submit a new job.</p>
          <p>All submissions will be visible upon approval.</p>
        </SubmissionCard>
      </Col>
      <Col xs={24} md={12} lg={6}>
        <SubmissionCard title="Conference" formLink={SUBMISSIONS_CONFERENCE}>
          <p>Submit a new conference.</p>
          <p>All submissions will be visible immediately.</p>
        </SubmissionCard>
      </Col>
    </Row>
  );
}

export default HowToSubmit;
