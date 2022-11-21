import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineDataList from '../../common/components/InlineList';

class IsbnList extends Component {
  static renderIsbn(isbn) {
    const medium = isbn.get('medium');
    return (
      <span>
        <span>{isbn.get('value')}</span>
        {medium && <span> ({medium})</span>}
      </span>
    );
  }

  static extractKeyFromIsbn(isbn) {
    return isbn.get('value');
  }

  render() {
    const { isbns } = this.props;
    return (
      <InlineDataList
        label="ISBN"
        items={isbns}
        extractKey={IsbnList.extractKeyFromIsbn}
        renderItem={IsbnList.renderIsbn}
      />
    );
  }
}

IsbnList.propTypes = {
  isbns: PropTypes.instanceOf(List),
};

IsbnList.defaultProps = {
  isbns: null,
};

export default IsbnList;
