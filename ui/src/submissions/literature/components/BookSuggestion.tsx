import React, { Component } from 'react';

type Props = {
    book: {
        [key: string]: $TSFixMe;
    };
};

class BookSuggestion extends Component<Props> {

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

export default BookSuggestion;
