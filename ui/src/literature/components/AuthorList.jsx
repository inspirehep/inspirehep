import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Modal } from 'antd';

import InlineList from '../../common/components/InlineList';
import AuthorLink from './AuthorLink';

class AuthorList extends Component {
  constructor(props) {
    super(props);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onModalOpen = this.onModalOpen.bind(this);

    this.state = {
      modalVisible: false,
    };
  }

  onModalOpen() {
    this.setState({ modalVisible: true });
  }

  onModalCancel() {
    this.setState({ modalVisible: false });
  }

  renderSuffix() {
    const { authors, limit } = this.props;
    if (authors.size > limit) {
      return (
        <div className="di">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */}
          <a onClick={this.onModalOpen}> Show all</a>
        </div>
      );
    }
    return null;
  }

  renderInlineList(suffix = null) {
    const { authors, limit, recordId, wrapperClassName } = this.props;
    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        items={authors.take(limit)}
        suffix={suffix}
        extractKey={author => author.get('full_name')}
        renderItem={author => (
          <AuthorLink author={author} recordId={recordId} />
        )}
      />
    );
  }

  render() {
    const { modalVisible } = this.state;
    const { authors } = this.props;
    return (
      <Fragment>
        {this.renderInlineList(this.renderSuffix())}
        <Modal
          title={`${authors.size} authors`}
          width="50%"
          visible={modalVisible}
          footer={null}
          onCancel={this.onModalCancel}
        >
          {this.renderInlineList()}
        </Modal>
      </Fragment>
    );
  }
}

AuthorList.propTypes = {
  authors: PropTypes.instanceOf(List),
  recordId: PropTypes.number,
  limit: PropTypes.number,
  wrapperClassName: PropTypes.string,
};

AuthorList.defaultProps = {
  authors: List(),
  limit: 5,
  recordId: undefined,
  wrapperClassName: null,
};

export default AuthorList;
