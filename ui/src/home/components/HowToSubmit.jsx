import React from 'react';
import { Row, Col } from 'antd';

import {
  SUBMISSIONS_LITERATURE,
  SUBMISSIONS_AUTHOR,
  SUBMISSIONS_JOB,
  SUBMISSIONS_CONFERENCE,
  SUBMISSIONS_SEMINAR,
} from '../../common/routes';
import SubmissionCard from './SubmissionCard';

function HowToSubmit() {
  return (
    <Row justify="center">
      <Col className="pa3">
        <SubmissionCard title="Literature" formLink={SUBMISSIONS_LITERATURE}>
          <p>Suggest missing articles.</p>
          <p>All submissions will be visible upon approval.</p>
        </SubmissionCard>
      </Col>
      <Col className="pa3">
        <SubmissionCard title="Author" formLink={SUBMISSIONS_AUTHOR}>
          <p>Create the profile of a new author.</p>
          <p>All submissions will be visible upon approval.</p>
        </SubmissionCard>
      </Col>
      <Col className="pa3">
        <SubmissionCard title="Job" formLink={SUBMISSIONS_JOB}>
          <p>Submit a new job.</p>
          <p>All submissions will be visible upon approval.</p>
        </SubmissionCard>
      </Col>
      <Col className="pa3">
        <SubmissionCard title="Seminar" formLink={SUBMISSIONS_SEMINAR}>
          <p>Submit a new seminar.</p>
          <p>All submissions will be visible immediately.</p>
        </SubmissionCard>
      </Col>
      <Col className="pa3">
        <SubmissionCard title="Conference" formLink={SUBMISSIONS_CONFERENCE}>
          <p>Submit a new conference.</p>
          <p>All submissions will be visible immediately.</p>
        </SubmissionCard>
      </Col>
    </Row>
  );
}

export default HowToSubmit;
