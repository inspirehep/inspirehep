import React from 'react';

import LinkWithEncodedLiteratureQuery from './LinkWithEncodedLiteratureQuery';
import ContentBox from '../../common/components/ContentBox';

const EXAMPLES = [
  'n=2 pedestrians tachikawa',
  'superconformal field theories Maldacena 1997',
  '1207.7214',
];

function renderExample(freetextSearch: any) {
  return (
    <div key={freetextSearch}>
      // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
      <LinkWithEncodedLiteratureQuery query={freetextSearch} />
    </div>
  );
}

function FreetextExamples() {
  return (
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
