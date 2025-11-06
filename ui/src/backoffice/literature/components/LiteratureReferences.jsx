import React from 'react';
import { Table } from 'antd';

const columns = [
  {
    title: 'Authors',
    dataIndex: 'authors',
    key: 'authors',
    render: (authors) =>
      authors?.length ? authors.map((a) => a.full_name).join('; ') : '—',
  },
  {
    title: 'Journal Info',
    dataIndex: 'artid',
    key: 'artid',
    render: (v) => v ?? '—',
    width: 160,
  },
  {
    title: 'Year',
    dataIndex: 'year',
    key: 'year',
    render: (v) => v ?? '—',
    width: 90,
  },
  {
    title: 'Misc',
    dataIndex: 'misc',
    key: 'misc',
    render: (v) => (v?.length ? v.join(', ') : '—'),
  },
];

const referencesToDataSource = (references) =>
  references.map((r, idx) => {
    const reference = r?.reference ?? {};
    const publicationInfo = reference.publication_info ?? {};

    return {
      key: `${idx}`,
      authors: reference.authors ?? [],
      artid: publicationInfo?.artid,
      year: publicationInfo?.year,
      misc: reference.misc,
    };
  });

const LiteratureReferences = ({ references }) => {
  if (!references || (Array.isArray(references) && references.length === 0))
    return null;

  const dataSource = referencesToDataSource(references);

  return (
    <div data-testid="literature-references">
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: 480 }}
      />
    </div>
  );
};

export default LiteratureReferences;
