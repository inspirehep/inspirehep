import React, { Component } from 'react';
import PropTypes from 'prop-types';

class BookSuggestion extends Component {
  render() {
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

BookSuggestion.propTypes = {
  book: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default BookSuggestion;
