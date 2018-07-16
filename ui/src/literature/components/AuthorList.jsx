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
    const { showAll } = this.props;
    if (showAll) {
      return (
        <div className="di">
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions, jsx-a11y/anchor-is-valid */}
          <a onClick={this.onModalOpen}> Show all</a>
        </div>
      );
    }
    return <span> et al.</span>;
  }

  renderInlineList(items, suffix = true) {
    const { authors, limit, recordId, wrapperClassName } = this.props;
    return (
      <InlineList
        wrapperClassName={wrapperClassName}
        items={items}
        suffix={authors.size > limit && suffix ? this.renderSuffix() : null}
        extractKey={author => author.get('full_name')}
        renderItem={author => (
          <AuthorLink author={author} recordId={recordId} />
        )}
      />
    );
  }

  render() {
    const { modalVisible } = this.state;
    const { authors, limit, total } = this.props;
    const showTotal = total === -1 ? authors.size : total;
    return (
      <Fragment>
        {this.renderInlineList(authors.take(limit))}
        <Modal
          title={`${showTotal} authors`}
          width="50%"
          visible={modalVisible}
          footer={null}
          onCancel={this.onModalCancel}
        >
          {this.renderInlineList(authors, false)}
        </Modal>
      </Fragment>
    );
  }
}

AuthorList.propTypes = {
  authors: PropTypes.instanceOf(List),
  limit: PropTypes.number,
  recordId: PropTypes.number,
  showAll: PropTypes.bool,
  total: PropTypes.number,
  wrapperClassName: PropTypes.string,
};

AuthorList.defaultProps = {
  authors: List(),
  limit: 5,
  recordId: undefined,
  showAll: false,
  total: -1,
  wrapperClassName: null,
};

export default AuthorList;
