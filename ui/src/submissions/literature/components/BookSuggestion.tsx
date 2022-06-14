import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BookSuggestion extends Component {
  render() {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'book' does not exist on type 'Readonly<{... Remove this comment to see the full error message
    const { book } = this.props;
    const { authors, titles } = book;
    const { title } = titles[0];
    const firstAuthor = authors && authors[0] && authors[0].full_name;
    return (
      <>
        <div>
          <strong>{title}</strong>
        </div>
        <div className="f7">
          <span>{firstAuthor}</span>
        </div>
      </>
    );
  }
}

// @ts-expect-error ts-migrate(2339) FIXME: Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
BookSuggestion.propTypes = {
  book: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default BookSuggestion;
