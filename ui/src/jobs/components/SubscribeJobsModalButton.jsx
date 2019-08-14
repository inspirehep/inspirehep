import React, { Component } from 'react';
import { Modal, Input, Icon, Alert } from 'antd';
import LinkLikeButton from '../../common/components/LinkLikeButton';
import ResponsiveView from '../../common/components/ResponsiveView';
import subscribeJobMailingList from '../subscribeJobMailingList';

export default class SubscribeJobsModalButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isModalVisible: false,
      hasError: false,
      email: null,
      firstName: null,
      lastName: null,
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
      this.setState({ hasError: false, isModalVisible: false });
    } catch (error) {
      this.setState({ hasError: true });
    }
  }

  render() {
    const { isModalVisible, email, firstName, lastName, hasError } = this.state;
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
        >
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
              To be notified via email of new jobs in High Energy Physics,
              please fill in the following information:
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
        </Modal>
      </>
    );
  }
}
