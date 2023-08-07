import React from 'react';

function BookSuggestion({ book }: { book: any }) {
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

export default BookSuggestion;
