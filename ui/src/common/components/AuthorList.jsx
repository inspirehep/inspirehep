import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Modal } from 'antd';

import InlineDataList from './InlineList';
import Author from './Author';
import SecondaryButton from './SecondaryButton';
import { getAuthorName } from '../utils';

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

  renderShowAllOrEtAl() {
    const { enableShowAll, authors } = this.props;
    if (enableShowAll) {
      return (
        <div className="di pl1">
          <SecondaryButton onClick={this.onModalOpen}>
            Show All({authors.size})
          </SecondaryButton>
        </div>
      );
    }
    return <span> et al.</span>;
  }

  renderAuthorList(authorsToDisplay, displayShowAll = true) {
    const { authors, limit, wrapperClassName, page, unlinked } = this.props;
    return (
      <InlineDataList
        wrapperClassName={wrapperClassName}
        items={authorsToDisplay}
        suffix={
          authors.size > limit && displayShowAll
            ? this.renderShowAllOrEtAl()
            : null
        }
        extractKey={getAuthorName}
        renderItem={(author) => (
          <Author author={author} page={page} unlinked={unlinked} />
        )}
      />
    );
  }

  render() {
    const { modalVisible } = this.state;
    const { authors, limit, total } = this.props;
    const showTotal = total === -1 ? authors.size : total;
    return (
      <>
        {this.renderAuthorList(authors.take(limit))}
        <Modal
          title={`${showTotal} authors`}
          width="50%"
          open={modalVisible}
          footer={null}
          onCancel={this.onModalCancel}
        >
          {this.renderAuthorList(authors, false)}
        </Modal>
      </>
    );
  }
}

AuthorList.propTypes = {
  authors: PropTypes.instanceOf(List),
  limit: PropTypes.number,
  enableShowAll: PropTypes.bool,
  total: PropTypes.number,
  wrapperClassName: PropTypes.string,
};

AuthorList.defaultProps = {
  authors: List(),
  limit: 5,
  enableShowAll: false,
  total: -1,
  wrapperClassName: null,
};

export default AuthorList;
