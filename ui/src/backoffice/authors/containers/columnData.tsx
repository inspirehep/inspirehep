import { TableColumnsType } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface InstitutionRow {
  institution?: string;
  start_date?: string;
  end_date?: string;
  rank?: string;
  current?: boolean;
}

interface ProjectRow {
  name?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
}

interface SubjectRow {
  term?: string;
}

interface AdvisorRow {
  name?: string;
  degree_type?: string;
}

export const columnsInstitutions: TableColumnsType<InstitutionRow> = [
  {
    title: 'Institution',
    dataIndex: 'institution',
  },
  {
    title: 'Start Date',
    dataIndex: 'start_date',
    render: (start: string) => (!start ? '-' : start),
  },
  {
    title: 'End Date',
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

export const columnsProjects: TableColumnsType<ProjectRow> = [
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

export const columnsSubject: TableColumnsType<SubjectRow> = [
  {
    title: 'Term',
    dataIndex: 'term',
  },
];

export const columnsAdvisors: TableColumnsType<AdvisorRow> = [
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
