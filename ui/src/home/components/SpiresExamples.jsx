import React from 'react';
import { Table } from 'antd';

import LinkWithEncodedLiteratureQuery from './LinkWithEncodedLiteratureQuery';

const TABLE_COLUMNS = [
  {
    title: 'Search by',
    dataIndex: 'searchBy',
  },
  {
    title: 'Use operators',
    dataIndex: 'useOperators',
  },
  {
    title: 'Example',
    dataIndex: 'example',
    render: query => <LinkWithEncodedLiteratureQuery query={query} />,
  },
];

const TABLE_DATA = [
  {
    key: 'a',
    searchBy: 'Author name',
    useOperators: 'a, au, author, name',
    example: 'a witten',
  },
  {
    key: 'a(BAI)',
    searchBy: 'Author BAI',
    useOperators: 'a, au, author, name',
    example: 'a J.M.Maldacena.1',
  },
  {
    key: 'cn',
    searchBy: 'Collaboration',
    useOperators: 'cn, collaboration',
    example: 'cn babar',
  },
  {
    key: 'ac',
    searchBy: 'Number of authors',
    useOperators: 'ac, authorcount',
    example: 'ac 1->10',
  },
  {
    key: 'topcite',
    searchBy: 'Citation number',
    useOperators: 'topcite, topcit, cited',
    example: 'topcite 1000+',
  },
];

function SpiresExamples() {
  return (
    <Table
      bordered
      size="small"
      dataSource={TABLE_DATA}
      columns={TABLE_COLUMNS}
      pagination={false}
    />
  );
}

export default SpiresExamples;
