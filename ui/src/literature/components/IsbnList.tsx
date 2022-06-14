import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';

import InlineList from '../../common/components/InlineList';

class IsbnList extends Component {
  static renderIsbn(isbn: any) {
    const medium = isbn.get('medium');
    return (
      <span>
        <span>{isbn.get('value')}</span>
        {medium && <span> ({medium})</span>}
      </span>
    );
  }

  static extractKeyFromIsbn(isbn: any) {
    return isbn.get('value');
  }

  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'isbns' does not exist on type 'Readonly<... Remove this comment to see the full error message
    const { isbns } = this.props;
    return (
      <InlineList
        // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
        label="ISBN"
        items={isbns}
        extractKey={IsbnList.extractKeyFromIsbn}
        renderItem={IsbnList.renderIsbn}
      />
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
IsbnList.propTypes = {
  // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'typeof List' is not assignable t... Remove this comment to see the full error message
  isbns: PropTypes.instanceOf(List),
};

// @ts-expect-error ts-migrate(2339) FIXME: Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
IsbnList.defaultProps = {
  isbns: null,
};

export default IsbnList;
