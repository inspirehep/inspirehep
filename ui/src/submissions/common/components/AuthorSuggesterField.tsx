import React from 'react';
import { Field } from 'formik';
import SuggesterField from './SuggesterField';

function getSourceNameValue(suggestion) {
  return suggestion._source.name.value;
}

function renderAuthorSuggestion(suggestion) {
  const name = getSourceNameValue(suggestion);

  const { positions } = suggestion._source;
  const currentPosition =
    positions && positions.find(position => position.current);

  return (
    <span>
      {name} {currentPosition && <span> ({currentPosition.institution})</span>}
    </span>
  );
}

export default function AuthorSuggesterField(props) {
  return (
    <Field
      {...props}
      pidType="authors"
      suggesterName="author"
      renderResultItem={renderAuthorSuggestion}
      extractItemCompletionValue={getSourceNameValue}
      component={SuggesterField}
    />
  );
}
