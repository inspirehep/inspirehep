import React from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';

export const columnsInstitutions = [
  {
    title: 'Institution',
    dataIndex: 'institution',
  },
  {
    title: 'Start date',
    dataIndex: 'start_date',
    render: (start: string) => (!start ? '-' : start),
  },
  {
    title: 'End date',
    dataIndex: 'end_date',
    render: (end: string) => (!end ? '-' : end),
  },
  {
    title: 'Rank',
    dataIndex: 'rank',
    render: (rank: string) => (!rank ? '-' : rank),
  },
  {
    title: 'Current',
    dataIndex: 'current',
    render: (current: boolean) =>
      current ? (
        <CheckCircleOutlined style={{ color: 'green' }} />
      ) : (
        <CloseCircleOutlined style={{ color: 'red' }} />
      ),
    align: 'center' as const,
  },
];

export const columnsProjects = [
  {
    title: 'Project name',
    dataIndex: 'name',
  },
  {
    title: 'Start date',
    dataIndex: 'start_date',
    render: (start: string) => (!start ? '-' : start),
  },
  {
    title: 'End date',
    dataIndex: 'end_date',
    render: (end: string) => (!end ? '-' : end),
  },
  {
    title: 'Current',
    dataIndex: 'current',
    render: (current: boolean) =>
      current ? (
        <CheckCircleOutlined style={{ color: 'green' }} />
      ) : (
        <CloseCircleOutlined style={{ color: 'red' }} />
      ),
    align: 'center' as const,
  },
];

export const columnsSubject = [
  {
    title: 'Term',
    dataIndex: 'term',
  },
  {
    title: 'Action',
    // TODO 0: Add action to remove term
    render: () => (
      <span className="blue b pointer">
        <CloseOutlined />
      </span>
    ),
    width: '10%',
    align: 'center' as const,
  },
];

export const columnsAdvisors = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Position',
    dataIndex: 'degree_type',
    render: (deg: string) => (!deg ? '-' : deg),
  },
];
