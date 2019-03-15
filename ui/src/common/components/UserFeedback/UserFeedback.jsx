import React, { Component } from 'react';
import { Modal, Button, Rate, Input, Alert, Icon } from 'antd';

import './UserFeedback.scss';
import styleVariables from '../../../styleVariables';
import { trackEvent, checkIsTrackerBlocked } from '../../../tracker';
import ExternalLink from '../ExternalLink';
import ResponsiveView from '../ResponsiveView';

const RATE_DESCRIPTIONS = [
  'poor',
  'below average',
  'average',
  'good',
  'excellent',
];

const SURVEY_LINK = 'https://goo.gl/forms/aTYSRzd7vTUhxzL43';

class UserFeedback extends Component {
  static renderThankYou() {
    return (
      <div>
        <div className="mb4 tc f-5">
          <Icon
            type="check-circle"
            theme="twoTone"
            twoToneColor={styleVariables['success-color']}
          />
        </div>
        <div className="tc f5">
          <div>Thank you for your response.</div>
          <div>
            For further feedback, please{' '}
            <ExternalLink href={SURVEY_LINK}>take our survey</ExternalLink>
            .
          </div>
          <div>It takes around 5 minutes to complete.</div>
        </div>
      </div>
    );
  }

  constructor(props) {
    super(props);

    this.onFeedbackClick = this.onFeedbackClick.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onFeedbackSubmit = this.onFeedbackSubmit.bind(this);
    this.onCommentChange = this.onCommentChange.bind(this);
    this.onRateChange = this.onRateChange.bind(this);
    this.afterModalClose = this.afterModalClose.bind(this);

    this.state = {
      isModalVisible: false,
      isFeedbackButtonVisible: true,
      feedbackSubmitted: false,
      rateValue: 0,
    };
  }

  onFeedbackClick() {
    this.setState({
      isModalVisible: true,
      isFeedbackButtonVisible: false,
    });
  }

  onModalCancel() {
    this.setState({
      isModalVisible: false,
      isFeedbackButtonVisible: true,
    });
  }

  onFeedbackSubmit() {
    const { rateValue, commentValue } = this.state;
    trackEvent('Feedback', 'Main', commentValue, rateValue);
    this.setState({
      rateValue: 0,
      commentValue: null,
      feedbackSubmitted: true,
    });
  }

  onCommentChange(event) {
    const { value } = event.target;
    this.setState({ commentValue: value });
  }

  onRateChange(rateValue) {
    this.setState({ rateValue });
  }

  afterModalClose() {
    this.setState({
      feedbackSubmitted: false,
    });
  }

  renderFeedbackForm() {
    const { rateValue, commentValue } = this.state;
    const isTrackerBlocked = checkIsTrackerBlocked();
    return (
      <>
        {isTrackerBlocked && (
          <div className="mb4">
            <Alert
              type="warning"
              showIcon
              message="AdBlock detected"
              description={
                <span>
                  To send us your feedback, please disable your adblocker or
                  DoNotTrack and refresh the page or send us your feedback using
                  the{' '}
                  <ExternalLink href={SURVEY_LINK}>feedback form</ExternalLink>
                </span>
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
              onChange={this.onRateChange}
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
              onChange={this.onCommentChange}
            />
          </div>
        </div>
      </>
    );
  }

  render() {
    const {
      isModalVisible,
      isFeedbackButtonVisible,
      feedbackSubmitted,
    } = this.state;
    const isTrackerBlocked = checkIsTrackerBlocked();
    return (
      <div className="__UserFeedback__">
        {isFeedbackButtonVisible && (
          <Button
            className="feedback-button"
            type="primary"
            size="large"
            icon="message"
            onClick={this.onFeedbackClick}
          >
            <ResponsiveView min="sm" render={() => <span>Feedback</span>} />
          </Button>
        )}
        <Modal
          title="Your Feedback"
          visible={isModalVisible}
          onOk={this.onFeedbackSubmit}
          okText="Submit"
          okButtonProps={{ disabled: isTrackerBlocked }}
          onCancel={this.onModalCancel}
          footer={feedbackSubmitted ? null : undefined}
          afterClose={this.afterModalClose}
        >
          {feedbackSubmitted
            ? UserFeedback.renderThankYou()
            : this.renderFeedbackForm()}
        </Modal>
      </div>
    );
  }
}

export default UserFeedback;
