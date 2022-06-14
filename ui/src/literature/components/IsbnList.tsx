import React, { Component } from 'react';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

type OwnProps = {
    isbns?: $TSFixMe; // TODO: PropTypes.instanceOf(List)
};

type Props = OwnProps & typeof IsbnList.defaultProps;

class IsbnList extends Component<Props> {

static defaultProps = {
    isbns: null,
};

  static renderIsbn(isbn: $TSFixMe) {
    const medium = isbn.get('medium');
    return (
      <span>
        <span>{isbn.get('value')}</span>
        {medium && <span> ({medium})</span>}
      </span>
    );
  }

  static extractKeyFromIsbn(isbn: $TSFixMe) {
    return isbn.get('value');
  }

  render() {
    const { isbns } = this.props;
    return (
      <InlineList
        label="ISBN"
        items={isbns}
        extractKey={IsbnList.extractKeyFromIsbn}
        renderItem={IsbnList.renderIsbn}
      />
    );
  }
}

export default IsbnList;
