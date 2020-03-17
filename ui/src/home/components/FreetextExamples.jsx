import React from 'react';
import { List } from 'antd';

import LinkWithEncodedLiteratureQuery from './LinkWithEncodedLiteratureQuery';

const EXAMPLES = [
  'n=2 pedestrians tachikawa',
  'superconformal field theories Maldacena 1997',
  '1207.7214',
];

function renderExample(freetextSearch) {
  return (
    <List.Item>
      <LinkWithEncodedLiteratureQuery query={freetextSearch} />
    </List.Item>
  );
}

function FreetextExamples() {
  return (
    <List
      className="bg-white"
      bordered
      size="small"
      dataSource={EXAMPLES}
      renderItem={renderExample}
    />
  );
}

export default FreetextExamples;
