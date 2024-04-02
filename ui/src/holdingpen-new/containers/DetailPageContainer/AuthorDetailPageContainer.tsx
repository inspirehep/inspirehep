import React from 'react';
import { Row, Col, Button, Table } from 'antd';
import {
  LinkedinOutlined,
  GithubOutlined,
  EditOutlined,
  RedoOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { List } from 'immutable';

import './DetailPageContainer.less';
import Breadcrumbs from '../../components/Breadcrumbs';
import item from '../../mocks/mockAuthorData';
import ContentBox from '../../../common/components/ContentBox';
import LiteratureTitle from '../../../common/components/LiteratureTitle';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';

interface AuthorDetailPageContainerProps {
  item: any;
}

const OPEN_SECTIONS = ['institutions', 'projects', 'links', 'other', 'delete'];

const columnsInstitutions = [
  {
    title: 'Institution',
    dataIndex: 'name',
    key: 'institution',
  },
  {
    title: 'Start date',
    dataIndex: 'start_date',
    key: 'start',
  },
  {
    title: 'End date',
    dataIndex: 'end_date',
    key: 'end',
  },
  {
    title: 'Rank',
    dataIndex: 'rank',
    key: 'rank',
  },
  {
    title: 'Current',
    dataIndex: 'current',
    key: 'current',
    render: (current: string) =>
      current === 'true' ? (
        <CheckCircleOutlined style={{ color: 'green' }} />
      ) : (
        <CloseCircleOutlined style={{ color: 'red' }} />
      ),
    align: 'center' as const,
  },
];

const columnsProjects = [
  {
    title: 'Project name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Current',
    dataIndex: 'current',
    key: 'current',
    render: (current: string) =>
      current === 'true' ? (
        <CheckCircleOutlined style={{ color: 'green' }} />
      ) : (
        <CloseCircleOutlined style={{ color: 'red' }} />
      ),
    align: 'center' as const,
  },
  {
    title: 'Start date',
    dataIndex: 'start_date',
    key: 'start',
  },
  {
    title: 'End date',
    dataIndex: 'end_date',
    key: 'end',
  },
];

const columnsSubject = [
  {
    title: 'Term',
    dataIndex: 'term',
    key: 'term',
  },
  {
    title: 'Action',
    key: 'action',
    render: () => <span className="blue b">x</span>,
    width: '10%',
    align: 'center' as const,
  },
];

const columnsAdvisors = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Position',
    dataIndex: 'position',
    key: 'position',
  },
  {
    title: 'Action',
    key: 'action',
    render: () => <span className="blue b">x</span>,
    width: '10%',
    align: 'center' as const,
  },
];

const AuthorDetailPageContainer: React.FC<
  AuthorDetailPageContainerProps
> = () => {
  const { Column } = Table;
  return (
    <div
      className="__DetailPageContainer__"
      data-testid="holdingpen-detail-page"
    >
      <Breadcrumbs
        title1="Search"
        href1={`${document.referrer}`}
        title2={(item?.getIn(['name', 'title']) as string) || 'Details'}
        href2={`${item?.get('id')}`}
      />
      <Row justify="center">
        <Col xs={24} md={22} lg={21} xxl={18}>
          <Row className="mv3" justify="center" gutter={35}>
            <Col xs={24}>
              <div className="bg-halted w-100">
                <p className="b f3 tc pv2">
                  HALTED on: &lsquo;Accept submission?&rsquo;
                </p>
              </div>
            </Col>
          </Row>
          <Row className="mv3" justify="center" gutter={35}>
            <Col xs={24} lg={16}>
              <ContentBox fullHeight={false} className="md-pb3 mb3">
                <h2>
                  <LiteratureTitle title={item.get('name')} />
                </h2>
                <p>
                  <b>Preferred name:</b> {item.get('preferred_name')}
                </p>
                <p>
                  <b>Status:</b> {item.get('status')}
                </p>
                <p className="mb0">
                  <b>ORCID:</b>{' '}
                  <a
                    href={`https://orcid.org/my-orcid?orcid=${item.get(
                      'orcid'
                    )}`}
                  >
                    {item.get('orcid')}
                  </a>
                </p>
              </ContentBox>
              <CollapsableForm openSections={OPEN_SECTIONS}>
                <CollapsableForm.Section
                  header="Institution history"
                  key="institutions"
                >
                  <Table
                    columns={columnsInstitutions}
                    dataSource={
                      (item.get('institutions') as List<any>)?.toJS() as any[]
                    }
                    pagination={false}
                    size="small"
                  />
                </CollapsableForm.Section>
                <CollapsableForm.Section
                  header="Project membership history"
                  key="projects"
                >
                  <Table
                    columns={columnsProjects}
                    dataSource={
                      (item.get('projects') as List<any>)?.toJS() as any[]
                    }
                    pagination={false}
                    size="small"
                  />
                </CollapsableForm.Section>
                <CollapsableForm.Section header="Links" key="links">
                  <p>
                    <LinkedinOutlined /> <b className="dib ml1">Linkedin: </b>
                    <a href="/"> rk-pradhan</a>
                  </p>
                  <p className="mb0">
                    <GithubOutlined /> <b className="dib ml1">Github: </b>
                    <a href="/"> https://github.com/Rk-pradhan</a>
                  </p>
                </CollapsableForm.Section>
                <CollapsableForm.Section header="Other" key="other">
                  <Row justify="space-between" gutter={12}>
                    <Col xl={12}>
                      <h3 className="mb3">Subject areas</h3>
                      <Table
                        columns={columnsSubject}
                        dataSource={
                          (
                            item.get('subject_areas') as List<any>
                          )?.toJS() as any[]
                        }
                        pagination={false}
                        size="small"
                      />
                    </Col>
                    <Col xl={12}>
                      <h3 className="mb3">Advisors</h3>
                      <Table
                        columns={columnsAdvisors}
                        dataSource={
                          (item.get('advisors') as List<any>)?.toJS() as any[]
                        }
                        pagination={false}
                        size="small"
                      />
                    </Col>
                  </Row>
                </CollapsableForm.Section>
                <CollapsableForm.Section header="Danger area" key="delete">
                  <Button className="font-white bg-error">Delete</Button>
                </CollapsableForm.Section>
              </CollapsableForm>
            </Col>
            <Col xs={24} lg={8}>
              <ContentBox
                className="mb3"
                fullHeight={false}
                subTitle="Decision"
              >
                <div className="w-100 flex flex-column items-center">
                  <Button type="primary" className="font-white w-50 mb2">
                    Review submisssion
                  </Button>
                  <Button className="font-white bg-completed w-50 mb2">
                    Accept
                  </Button>
                  <Button className="font-white bg-halted w-50 mb2">
                    Accept + Curation
                  </Button>
                  <Button className="font-white bg-error w-50 mb2">
                    Reject
                  </Button>
                </div>
              </ContentBox>
              <ContentBox
                className="mb3"
                fullHeight={false}
                subTitle="Submission"
              >
                Submitted by <i>kumarriteshpradhan@gmail.com</i> on{' '}
                <b>
                  {new Date('2024-05-20T15:30:20.467877').toLocaleDateString()}
                </b>
                .
              </ContentBox>
              <ContentBox className="mb3" fullHeight={false} subTitle="Notes">
                <i>&quot;Thank you for reviewing my submission&ldquo;</i>
              </ContentBox>
              <ContentBox
                className="mb3"
                fullHeight={false}
                subTitle="SNow information"
              >
                <a href="/">
                  See related ticket (#3fd9a10997dec2906fd43e871153af58)
                </a>
              </ContentBox>
              <ContentBox fullHeight={false} subTitle="Actions">
                <div className="flex flex-column">
                  <Button className="mb2">
                    <SyncOutlined />
                    Restart workflow
                  </Button>
                  <Button className="mb2">
                    <RedoOutlined />
                    Restart current step
                  </Button>
                  <Button type="primary">
                    <EditOutlined />
                    Open in Editor
                  </Button>
                </div>
              </ContentBox>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default AuthorDetailPageContainer;
