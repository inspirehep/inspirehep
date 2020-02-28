import React, { Component } from 'react';
import { MailOutlined } from '@ant-design/icons';
import { Modal, Alert, Typography } from 'antd';
import LinkLikeButton from '../../common/components/LinkLikeButton';
import ResponsiveView from '../../common/components/ResponsiveView';
import subscribeJobMailingList from '../subscribeJobMailingList';
import ModalSuccessResult from '../../common/components/ModalSuccessResult';
import SubscribeJobsForm from './SubscribeJobsForm';

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
      isSubscriptionSubmitted: false,
    };

    this.onClick = this.onClick.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.afterModalCloase = this.afterModalCloase.bind(this);
  }

  onModalCancel() {
    this.setState({ isModalVisible: false });
  }

  onClick() {
    this.setState({ isModalVisible: true });
  }

  async onFormSubmit(data) {
    try {
      await subscribeJobMailingList(data);
      this.setState({ hasError: false, isSubscriptionSubmitted: true });

      setTimeout(() => {
        this.setState({ isModalVisible: false });
      }, MODAL_AUTO_CLOSE_TIMEOUT_AFTER_SUBMISSION);
    } catch (error) {
      this.setState({ hasError: true });
    }
  }

  afterModalCloase() {
    this.setState({
      isSubscriptionSubmitted: false,
    });
  }

  renderSubscribeForm() {
    const { hasError } = this.state;
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
        <div className="mb3">
          To be notified via email of new jobs in High Energy Physics, please
          fill in the following information:
        </div>
        <SubscribeJobsForm onSubmit={this.onFormSubmit} />
      </div>
    );
  }

  render() {
    const { isModalVisible, isSubscriptionSubmitted } = this.state;
    return (
      <>
        <LinkLikeButton icon="mail" onClick={this.onClick}>
          <MailOutlined />
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
          afterClose={this.afterModalCloase}
          onCancel={this.onModalCancel}
          footer={null}
        >
          {isSubscriptionSubmitted
            ? SubscribeJobsModalButton.renderConfirmation()
            : this.renderSubscribeForm()}
        </Modal>
      </>
    );
  }
}
