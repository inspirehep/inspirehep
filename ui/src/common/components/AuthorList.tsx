import React, { Component, Fragment } from 'react';
import { List } from 'immutable';
import { Modal } from 'antd';

import InlineList from './InlineList';
import Author from './Author';
import SecondaryButton from './SecondaryButton';
import { getAuthorName } from '../utils';

type OwnProps = {
    authors?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
    limit?: number;
    enableShowAll?: boolean;
    total?: number;
    wrapperClassName?: string;
};

type State = $TSFixMe;

type Props = OwnProps & typeof AuthorList.defaultProps;

class AuthorList extends Component<Props, State> {

static defaultProps = {
    authors: List(),
    limit: 5,
    enableShowAll: false,
    total: -1,
    wrapperClassName: null,
};

  constructor(props: Props) {
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
      return (<div className="di pl1">
          <SecondaryButton onClick={this.onModalOpen}>
            Show All({(authors as $TSFixMe).size})
          </SecondaryButton>
        </div>);
    }
    return <span> et al.</span>;
  }

  renderAuthorList(authorsToDisplay: $TSFixMe, displayShowAll = true) {
    const { authors, limit, wrapperClassName } = this.props;
    return (<InlineList wrapperClassName={wrapperClassName} items={authorsToDisplay} suffix={(authors as $TSFixMe).size > limit && displayShowAll
        ? this.renderShowAllOrEtAl()
        : null} extractKey={getAuthorName} renderItem={(author: $TSFixMe) => <Author author={author}/>}/>);
  }

  render() {
    const { modalVisible } = this.state;
    const { authors, limit, total } = this.props;
    const showTotal = total === -1 ? (authors as $TSFixMe).size : total;
    return (<Fragment>
        {this.renderAuthorList((authors as $TSFixMe).take(limit))}
        <Modal title={`${showTotal} authors`} width="50%" visible={modalVisible} footer={null} onCancel={this.onModalCancel}>
          {this.renderAuthorList(authors, false)}
        </Modal>
      </Fragment>);
  }
}

export default AuthorList;
