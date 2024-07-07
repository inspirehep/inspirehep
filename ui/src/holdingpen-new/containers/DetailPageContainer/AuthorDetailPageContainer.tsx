/* eslint-disable no-underscore-dangle */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Table } from 'antd';
import {
  LinkOutlined,
  EditOutlined,
  RedoOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import './DetailPageContainer.less';
import Breadcrumbs from '../../components/Breadcrumbs';
import ContentBox from '../../../common/components/ContentBox';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import { BACKOFFICE_API } from '../../../common/routes';
import { authToken } from '../../token';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';

interface AuthorDetailPageContainerProps {
  item: any;
}

const columnsInstitutions = [
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
    render: (end: string) => (!end ? 'Present' : end),
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

const columnsProjects = [
  {
    title: 'Project name',
    dataIndex: 'name',
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
  {
    title: 'Start date',
    dataIndex: 'start_date',
    render: (start: string) => (!start ? '-' : start),
  },
  {
    title: 'End date',
    dataIndex: 'end_date',
    render: (end: string) => (!end ? 'Present' : end),
  },
];

const columnsSubject = [
  {
    title: 'Term',
    dataIndex: 'term',
  },
  {
    title: 'Action',
    // TODO: Add action to remove term
    render: () => (
      <span className="blue b pointer">
        <CloseOutlined />
      </span>
    ),
    width: '10%',
    align: 'center' as const,
  },
];

const columnsAdvisors = [
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

const fetchData = async (id: string) => {
  const res = await fetch(`${BACKOFFICE_API}/${id}`, authToken);
  const data = await res?.json();
  return data || { results: [], count: 0 };
};

const AuthorDetailPageContainer: React.FC<
  AuthorDetailPageContainerProps
> = () => {
  const [result, setResult] = useState<any>({});
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    (async () => {
      setResult(await fetchData(id));
    })();
  }, [id]);

  const {
    _workflow: workflow,
    metadata,
    _extra_data: extraData,
  } = result?.data || {};

  const OPEN_SECTIONS = [
    metadata?.positions && 'institutions',
    metadata?.project_membership && 'projects',
    metadata?.urls && 'links',
    (metadata?.arxiv_categories || metadata?.advisors) && 'other',
    extraData?._error_msg && 'errors',
    'delete',
  ].filter(Boolean);

  return (
    <div
      className="__DetailPageContainer__"
      data-testid="holdingpen-detail-page"
    >
      <Breadcrumbs
        title1="Search"
        href1={`${document.referrer}`}
        title2={metadata?.name?.value || 'Details'}
        href2={id}
      />
      <LoadingOrChildren loading={!result?.data}>
        <Row justify="center">
          <Col xs={24} md={22} lg={21} xxl={18}>
            {workflow?.status && (
              <Row className="mv3" justify="center" gutter={35}>
                <Col xs={24}>
                  <div
                    className={`bg-${workflow?.status?.toLowerCase()} w-100`}
                  >
                    <p className="b f3 tc pv2">
                      {workflow?.status}
                      {workflow?.status !== 'COMPLETED'
                        ? ` on: "${
                            extraData?._message || extraData?._last_task_name
                          }"`
                        : ''}
                    </p>
                  </div>
                </Col>
              </Row>
            )}
            <Row className="mv3" justify="center" gutter={35}>
              <Col xs={24} lg={16}>
                <ContentBox fullHeight={false} className="md-pb3 mb3">
                  <h2>{metadata?.name?.value}</h2>
                  {metadata?.name?.preferred_name && (
                    <p>
                      <b>Preferred name:</b> {metadata?.name?.preferred_name}
                    </p>
                  )}
                  {metadata?.status && (
                    <p>
                      <b>Status:</b> {metadata?.status}
                    </p>
                  )}
                  {metadata?.acquisition_source?.orcid && (
                    <p className="mb0">
                      <b>ORCID:</b>{' '}
                      <a
                        href={`https://orcid.org/my-orcid?orcid=${metadata?.acquisition_source?.orcid}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {metadata?.acquisition_source?.orcid}
                      </a>
                    </p>
                  )}
                </ContentBox>
                <CollapsableForm openSections={OPEN_SECTIONS}>
                  <CollapsableForm.Section
                    header="Institution history"
                    key="institutions"
                  >
                    <Table
                      columns={columnsInstitutions}
                      dataSource={metadata?.positions}
                      pagination={false}
                      size="small"
                      rowKey={(record) =>
                        `${record?.institution}+${Math.random()}`
                      }
                    />
                  </CollapsableForm.Section>
                  <CollapsableForm.Section
                    header="Project membership history"
                    key="projects"
                  >
                    <Table
                      columns={columnsProjects}
                      dataSource={metadata?.project_membership}
                      pagination={false}
                      size="small"
                      rowKey={(record) => `${record?.name}+${Math.random()}`}
                    />
                  </CollapsableForm.Section>
                  {metadata?.urls && (
                    <CollapsableForm.Section header="Links" key="links">
                      {metadata?.urls?.map(
                        (link: { value: string; description: string }) => (
                          <p key={link?.value}>
                            <LinkOutlined />
                            {link?.description && (
                              <b className="dib ml1 ttc">
                                {link?.description}:
                              </b>
                            )}{' '}
                            <a href={link?.value}>{link?.value}</a>
                          </p>
                        )
                      )}
                    </CollapsableForm.Section>
                  )}
                  <CollapsableForm.Section header="Other" key="other">
                    <Row justify="space-between" gutter={12}>
                      <Col xl={12}>
                        <h3 className="mb3">Subject areas</h3>
                        <Table
                          columns={columnsSubject}
                          dataSource={metadata?.arxiv_categories?.map(
                            (term: string) => ({ term })
                          )}
                          pagination={false}
                          size="small"
                          rowKey={(record) =>
                            `${record?.term}+${Math.random()}`
                          }
                        />
                      </Col>
                      <Col xl={12}>
                        <h3 className="mb3">Advisors</h3>
                        <Table
                          columns={columnsAdvisors}
                          dataSource={metadata?.advisors}
                          pagination={false}
                          size="small"
                          rowKey={(record) =>
                            `${record?.name}+${Math.random()}`
                          }
                        />
                      </Col>
                    </Row>
                  </CollapsableForm.Section>
                  {extraData?._error_msg && (
                    <CollapsableForm.Section header="Errors" key="errors">
                      <div className="bg-waiting error-code">
                        {extraData?._error_msg}
                      </div>
                    </CollapsableForm.Section>
                  )}
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
                    <Button type="primary" className="font-white w-75 mb2">
                      Review submission
                    </Button>
                    <Button className="font-white bg-completed w-75 mb2">
                      Accept
                    </Button>
                    <Button className="font-white bg-halted w-75 mb2">
                      Accept + Curation
                    </Button>
                    <Button className="font-white bg-error w-75 mb2">
                      Reject
                    </Button>
                  </div>
                </ContentBox>
                <ContentBox
                  className="mb3"
                  fullHeight={false}
                  subTitle="Submission"
                >
                  Submitted by <i>{metadata?.acquisition_source?.email}</i> on{' '}
                  <b>
                    {new Date(
                      metadata?.acquisition_source?.datetime
                    ).toLocaleDateString()}
                  </b>
                  .
                </ContentBox>
                {/* TODO: find out how notes are stored in workflow */}
                {metadata?.notes && (
                  <ContentBox
                    className="mb3"
                    fullHeight={false}
                    subTitle="Notes"
                  >
                    <i>&quot;Thank you for reviewing my submission&quot;</i>
                  </ContentBox>
                )}
                <ContentBox
                  className="mb3"
                  fullHeight={false}
                  subTitle="SNow information"
                >
                  {extraData?.ticket_id && (
                    <a
                      href={extraData?.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      See related ticket #{extraData?.ticket_id}
                    </a>
                  )}
                </ContentBox>
                <ContentBox fullHeight={false} subTitle="Actions">
                  <div className="flex flex-column items-center">
                    <Button className="mb2 w-75">
                      <SyncOutlined />
                      Restart workflow
                    </Button>
                    <Button className="mb2 w-75">
                      <RedoOutlined />
                      Restart current step
                    </Button>
                    <Button className="mb2 w-75" type="primary">
                      <a
                        href={`/editor/holdingpen/${metadata?.id}`}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <EditOutlined />
                        {'  '}
                        Open in Editor
                      </a>
                    </Button>
                    <Button className="w-75">
                      <PlayCircleOutlined />
                      Skip to next step
                    </Button>
                  </div>
                </ContentBox>
              </Col>
            </Row>
          </Col>
        </Row>
      </LoadingOrChildren>
    </div>
  );
};

export default AuthorDetailPageContainer;
