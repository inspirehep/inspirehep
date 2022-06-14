import React from 'react';

import LinkWithEncodedLiteratureQuery from './LinkWithEncodedLiteratureQuery';
import ContentBox from '../../common/components/ContentBox';

const EXAMPLES = [
  'n=2 pedestrians tachikawa',
  'superconformal field theories Maldacena 1997',
  '1207.7214',
];

function renderExample(freetextSearch: $TSFixMe) {
  return (
    <div key={freetextSearch}>
      <LinkWithEncodedLiteratureQuery query={freetextSearch} />
    </div>
  );
}

function FreetextExamples() {
  return (
    // @ts-expect-error ts-migrate(2746) FIXME: This JSX tag's 'children' prop expects a single ch... Remove this comment to see the full error message
    <ContentBox>
      <p>
        Users can also type free text searches using any combination of author
        names, title, dates etc.
      </p>
      {EXAMPLES.map(renderExample)}
    </ContentBox>
  );
}

export default FreetextExamples;
