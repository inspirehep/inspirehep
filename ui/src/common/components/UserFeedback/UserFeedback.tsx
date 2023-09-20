import React, { ChangeEventHandler, useState } from 'react';
import { MessageOutlined } from '@ant-design/icons';
import { Modal, Button, Rate, Input, Alert } from 'antd';

import './UserFeedback.less';
import { trackEvent, checkIsTrackerBlocked } from '../../../tracker';
import LinkWithTargetBlank from '../LinkWithTargetBlank';
import ResponsiveView from '../ResponsiveView';
import ModalSuccessResult from '../ModalSuccessResult';
import { SURVEY_LINK, FEEDBACK_EMAIL } from '../../constants';

const RATE_DESCRIPTIONS = [
  'poor',
  'below average',
  'average',
  'good',
  'excellent',
];

const UserFeedback = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFeedbackButtonVisible, setIsFeedbackButtonVisible] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [rateValue, setRateValue] = useState(0);
  const [commentValue, setCommentValue] = useState<string | undefined>(
    undefined
  );

  const isTrackerBlocked = checkIsTrackerBlocked();

  const onFeedbackClick = () => {
    setIsModalVisible(true);
    setIsFeedbackButtonVisible(false);
  };

  const onModalCancel = () => {
    setIsModalVisible(false);
    setIsFeedbackButtonVisible(true);
  };

  const onFeedbackSubmit = () => {
    trackEvent(
      'Feedback modal',
      'Feedback submission',
      `Feedback comment: ${commentValue}`,
      rateValue
    );
    setRateValue(0);
    setCommentValue(undefined);
    setFeedbackSubmitted(true);
  };

  const onCommentChange = (event: Event) => {
    const { value } = event.target as HTMLTextAreaElement;
    setCommentValue(value);
  };

  const onRateChange = (value: number) => {
    setRateValue(value);
  };

  const afterModalClose = () => {
    setFeedbackSubmitted(false);
  };

  const renderThankYou = () => {
    return (
      <ModalSuccessResult>
        <div>Thank you for your response.</div>
        <div>
          For further feedback, please{' '}
          <LinkWithTargetBlank href={SURVEY_LINK}>
            take our survey
          </LinkWithTargetBlank>
          .
        </div>
        <div>It takes around 5 minutes to complete.</div>
      </ModalSuccessResult>
    );
  };

  const renderFeedbackForm = () => {
    return (
      <>
        {isTrackerBlocked && (
          <div className="mb4">
            <Alert
              type="warning"
              showIcon
              message="AdBlock detected"
              description={
                <>
                  <p>
                    To send us your feedback, please disable your adblocker or
                    DoNotTrack and refresh the page.
                  </p>
                  <p>
                    Alternatively, you could send us your feedback using the{' '}
                    <LinkWithTargetBlank href={SURVEY_LINK}>
                      feedback form
                    </LinkWithTargetBlank>{' '}
                    or by email at{' '}
                    <LinkWithTargetBlank href={`mailto:${FEEDBACK_EMAIL}`}>
                      {FEEDBACK_EMAIL}
                    </LinkWithTargetBlank>
                    .
                  </p>
                </>
              }
            />
          </div>
        )}
        <div className="mb4">
          <div className="mb1">What is your opinion of the new INSPIRE?</div>
          <div>
            <Rate
              disabled={isTrackerBlocked}
              value={rateValue}
              onChange={onRateChange}
            />
            <span className="ant-rate-text">
              {RATE_DESCRIPTIONS[rateValue - 1]}
            </span>
          </div>
        </div>
        <div>
          <div className="mb1">Would you like to add a comment?</div>
          <div>
            <Input.TextArea
              disabled={isTrackerBlocked}
              placeholder="Please give your feedback here"
              rows={5}
              value={commentValue}
              onChange={
                onCommentChange as never as ChangeEventHandler<HTMLTextAreaElement>
              }
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="__UserFeedback__">
      {isFeedbackButtonVisible && (
        <Button
          data-test-id="sticky"
          className="feedback-button"
          type="primary"
          size="large"
          icon={<MessageOutlined />}
          onClick={onFeedbackClick}
        >
          <ResponsiveView min="sm" render={() => <span>Feedback</span>} />
        </Button>
      )}
      <Modal
        title="Your Feedback"
        open={isModalVisible}
        onOk={onFeedbackSubmit}
        okText="Submit"
        okButtonProps={{ disabled: isTrackerBlocked }}
        onCancel={onModalCancel}
        footer={feedbackSubmitted ? null : undefined} // undefined enables default footer with OK btn
        afterClose={afterModalClose}
      >
        {feedbackSubmitted ? renderThankYou() : renderFeedbackForm()}
      </Modal>
    </div>
  );
};

export default UserFeedback;
