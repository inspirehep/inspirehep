import React, { Component } from 'react';
import { Modal, Input, Icon, Alert, Typography } from 'antd';
import LinkLikeButton from '../../common/components/LinkLikeButton';
import ResponsiveView from '../../common/components/ResponsiveView';
import subscribeJobMailingList from '../subscribeJobMailingList';
import ModalSuccessResult from '../../common/components/ModalSuccessResult';

const MODAL_AUTO_CLOSE_TIMEOUT_AFTER_SUBMISSION = 4000;

export default class SubscribeJobsModalButton extends Component {
  static renderConfirmation() {
    return (
      <ModalSuccessResult>
        <Typography.Paragraph>
          You have successfully subscribed!
        </Typography.Paragraph>
        <Typography.Paragraph>
          You will receive a weekly update on new INSPIRE job listings every
          Monday.
        </Typography.Paragraph>
      </ModalSuccessResult>
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      isModalVisible: false,
      hasError: false,
      email: null,
      firstName: null,
      lastName: null,
      isSubscriptionSubmitted: false,
    };

    this.onClick = this.onClick.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onModalSubscribeClick = this.onModalSubscribeClick.bind(this);
  }

  onInputChange({ target }) {
    this.setState({
      [target.name]: target.value,
    });
  }

  onModalCancel() {
    this.setState({ isModalVisible: false });
  }

  onClick() {
    this.setState({ isModalVisible: true });
  }

  async onModalSubscribeClick() {
    const { email, firstName, lastName } = this.state;

    try {
      await subscribeJobMailingList({ email, firstName, lastName });
      this.setState({ hasError: false, isSubscriptionSubmitted: true });

      setTimeout(() => {
        this.setState({ isModalVisible: false });
      }, MODAL_AUTO_CLOSE_TIMEOUT_AFTER_SUBMISSION);
    } catch (error) {
      this.setState({ hasError: true });
    }
  }

  renderSubscribeForm() {
    const { email, firstName, lastName, hasError } = this.state;
    return (
      <div>
        {hasError && (
          <div className="mb3">
            <Alert
              type="error"
              showIcon
              description="Could not subscribe, please try again."
            />
          </div>
        )}
        <div>
          To be notified via email of new jobs in High Energy Physics, please
          fill in the following information:
        </div>
        <div className="mt3">
          <Input
            name="email"
            placeholder="Email"
            value={email}
            onChange={this.onInputChange}
          />
        </div>
        <div className="mt3">
          <Input
            name="firstName"
            placeholder="First Name"
            value={firstName}
            onChange={this.onInputChange}
          />
        </div>
        <div className="mt3">
          <Input
            name="lastName"
            placeholder="Last Name"
            value={lastName}
            onChange={this.onInputChange}
          />
        </div>
      </div>
    );
  }

  render() {
    const {
      isModalVisible,
      email,
      firstName,
      lastName,
      isSubscriptionSubmitted,
    } = this.state;
    const isSubscribeButtonDislabed = !(email && firstName && lastName);
    return (
      <>
        <LinkLikeButton icon="mail" onClick={this.onClick}>
          <Icon type="mail" />
          <ResponsiveView
            min="sm"
            render={() => (
              <span className="pl1">Subscribe to mailing list</span>
            )}
          />
        </LinkLikeButton>
        <Modal
          title="Subscribe to the INSPIRE job mailing list"
          visible={isModalVisible}
          okText="Subscribe"
          okButtonProps={{ disabled: isSubscribeButtonDislabed }}
          onCancel={this.onModalCancel}
          onOk={this.onModalSubscribeClick}
          footer={isSubscriptionSubmitted ? null : undefined} // undefined enables default footer with OK btn
        >
          {isSubscriptionSubmitted
            ? SubscribeJobsModalButton.renderConfirmation()
            : this.renderSubscribeForm()}
        </Modal>
      </>
    );
  }
}
