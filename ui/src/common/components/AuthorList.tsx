import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Modal } from 'antd';

import InlineList from './InlineList';
import Author from './Author';
import SecondaryButton from './SecondaryButton';
import { getAuthorName } from '../utils';

class AuthorList extends Component {
  constructor(props: any) {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'enableShowAll' does not exist on type 'R... Remove this comment to see the full error message
    const { enableShowAll, authors } = this.props;
    if (enableShowAll) {
      return (
        <div className="di pl1">
          // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
          <SecondaryButton onClick={this.onModalOpen}>
            Show All({authors.size})
          </SecondaryButton>
        </div>
      );
    }
    return <span> et al.</span>;
  }

  renderAuthorList(authorsToDisplay: any, displayShowAll = true) {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'authors' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { authors, limit, wrapperClassName } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        wrapperClassName={wrapperClassName}
        items={authorsToDisplay}
        suffix={
          authors.size > limit && displayShowAll
            ? this.renderShowAllOrEtAl()
            : null
        }
        extractKey={getAuthorName}
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        renderItem={(author: any) => <Author author={author} />}
      />
    );
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'modalVisible' does not exist on type 'Re... Remove this comment to see the full error message
    const { modalVisible } = this.state;
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'authors' does not exist on type 'Readonl... Remove this comment to see the full error message
    const { authors, limit, total } = this.props;
    const showTotal = total === -1 ? authors.size : total;
    return (
      <Fragment>
        {this.renderAuthorList(authors.take(limit))}
        <Modal
          title={`${showTotal} authors`}
          width="50%"
          visible={modalVisible}
          footer={null}
          onCancel={this.onModalCancel}
        >
          {this.renderAuthorList(authors, false)}
        </Modal>
      </Fragment>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
AuthorList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  authors: PropTypes.instanceOf(List),
  limit: PropTypes.number,
  enableShowAll: PropTypes.bool,
  total: PropTypes.number,
  wrapperClassName: PropTypes.string,
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
AuthorList.defaultProps = {
  authors: List(),
  limit: 5,
  enableShowAll: false,
  total: -1,
  wrapperClassName: null,
};

export default AuthorList;
