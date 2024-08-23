/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Table } from 'antd';
import {
  EditOutlined,
  RedoOutlined,
  SyncOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { Action, ActionCreator } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';

import './DetailPageContainer.less';
import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs';
import ContentBox from '../../../common/components/ContentBox';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { fetchAuthor, resolveAction } from '../../../actions/holdingpen';
import Links, { Ids } from '../../components/Links';
import {
  columnsInstitutions,
  columnsProjects,
  columnsSubject,
  columnsAdvisors,
} from './columnData';

interface AuthorDetailPageContainerProps {
  dispatch: ActionCreator<Action>;
  author: Map<string, any>;
  loading: boolean;
  actionInProgress: string | false;
}

const AuthorDetailPageContainer: React.FC<AuthorDetailPageContainerProps> = ({
  dispatch,
  author,
  loading,
  actionInProgress,
}) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(fetchAuthor(id));
  }, []);

  const data = author?.get('data') as Map<any, any>;

  const OPEN_SECTIONS = [
    data?.get('positions') && 'institutions',
    data?.get('project_membership') && 'projects',
    (data?.get('urls') || data?.get('ids')) && 'links',
    (data?.get('arxiv_categories') || data?.get('.advisors')) && 'other',
    author?.get('_error_msg') && 'errors',
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
        title2={(data?.getIn(['name', 'value']) as string) || 'Details'}
        href2={id}
      />
      <LoadingOrChildren loading={loading}>
        <Row justify="center">
          <Col xs={24} md={22} lg={21} xxl={18}>
            {author?.get('status') && (
              <Row className="mv3" justify="center" gutter={35}>
                <Col xs={24}>
                  <div
                    className={`bg-${author?.get('status')?.toLowerCase()} ${
                      author?.get('status') === 'error' ? 'white' : ''
                    } w-100`}
                  >
                    <p className="b f3 tc pv2">
                      {author?.get('status').toUpperCase()}
                    </p>
                  </div>
                </Col>
              </Row>
            )}
            <Row className="mv3" justify="center" gutter={35}>
              <Col xs={24} lg={16}>
                <ContentBox fullHeight={false} className="md-pb3 mb3">
                  <h2>{data?.getIn(['name', 'value'])}</h2>
                  {data?.getIn(['name', 'preferred_name']) && (
                    <p>
                      <b>Preferred name:</b>{' '}
                      {data?.getIn(['name', 'preferred_name'])}
                    </p>
                  )}
                  {data?.get('status') && (
                    <p>
                      <b>Status:</b> {data?.get('status')}
                    </p>
                  )}
                  {(data?.get('ids') as any[])?.find(
                    (id: any) => id?.get('schema') === 'ORCID'
                  ) && (
                    <Ids
                      ids={
                        (data?.get('ids') as any[])?.filter(
                          (id: any) => id?.get('schema') === 'ORCID'
                        ) as unknown as Map<string, any>
                      }
                      noIcon
                    />
                  )}
                </ContentBox>
                <CollapsableForm openSections={OPEN_SECTIONS}>
                  <CollapsableForm.Section
                    header="Institution history"
                    key="institutions"
                  >
                    <Table
                      columns={columnsInstitutions}
                      dataSource={data?.get('positions')?.toJS()}
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
                      dataSource={data?.get('project_membership')?.toJS()}
                      pagination={false}
                      size="small"
                      rowKey={(record) => `${record?.name}+${Math.random()}`}
                    />
                  </CollapsableForm.Section>
                  {(data?.get('urls') || data?.get('ids')) && (
                    <CollapsableForm.Section header="Links" key="links">
                      <Links urls={data?.get('urls')} ids={data?.get('ids')} />
                    </CollapsableForm.Section>
                  )}
                  <CollapsableForm.Section header="Other" key="other">
                    <Row justify="space-between" gutter={12}>
                      <Col xl={12}>
                        <h3 className="mb3">Subject areas</h3>
                        <Table
                          columns={columnsSubject}
                          dataSource={data
                            ?.get('arxiv_categories')
                            ?.toJS()
                            ?.map((term: string) => ({ term }))}
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
                          dataSource={data?.get('advisors')?.toJS()}
                          pagination={false}
                          size="small"
                          rowKey={(record) =>
                            `${record?.name}+${Math.random()}`
                          }
                        />
                      </Col>
                    </Row>
                  </CollapsableForm.Section>
                  {author?.get('_error_msg') && (
                    <CollapsableForm.Section header="Errors" key="errors">
                      <div className="bg-waiting error-code">
                        {author?.get('_error_msg')}
                      </div>
                    </CollapsableForm.Section>
                  )}
                  <CollapsableForm.Section header="Danger area" key="delete">
                    <Button className="font-white bg-error">Delete</Button>
                  </CollapsableForm.Section>
                </CollapsableForm>
              </Col>
              <Col xs={24} lg={8}>
                {author?.get('status') &&
                  author?.get('status') === 'approval' && (
                    <ContentBox
                      className="mb3"
                      fullHeight={false}
                      subTitle="Decision"
                    >
                      <div className="w-100 flex flex-column items-center">
                        <Button
                          className="font-white bg-completed w-75 mb2"
                          onClick={() =>
                            dispatch(
                              resolveAction(id, 'resolve', {
                                value: 'accept',
                                create_ticket: false,
                              })
                            )
                          }
                          loading={actionInProgress === 'resolve'}
                        >
                          Accept
                        </Button>
                        {/* TODO1: change to acceptSubmissionWithCuration once it's ready */}
                        <Button
                          className="font-white bg-halted w-75 mb2"
                          onClick={() =>
                            dispatch(
                              resolveAction(id, 'resolve', {
                                value: 'accept',
                                create_ticket: false,
                              })
                            )
                          }
                          loading={actionInProgress === 'resolve'}
                        >
                          Accept + Curation
                        </Button>
                        <Button
                          className="font-white bg-error w-75"
                          onClick={() =>
                            dispatch(
                              resolveAction(id, 'resolve', {
                                value: 'reject',
                                create_ticket: false,
                              })
                            )
                          }
                          loading={actionInProgress === 'resolve'}
                        >
                          Reject
                        </Button>
                      </div>
                    </ContentBox>
                  )}
                <ContentBox
                  className="mb3"
                  fullHeight={false}
                  subTitle="Submission"
                >
                  Submitted by{' '}
                  <i>{data?.getIn(['acquisition_source', 'email'])}</i> on{' '}
                  <b>
                    {new Date(
                      data?.getIn(['acquisition_source', 'datetime']) as Date
                    ).toLocaleDateString()}
                  </b>
                  .
                </ContentBox>
                {data?.get('_private_notes') && (
                  <ContentBox
                    className="mb3"
                    fullHeight={false}
                    subTitle="Notes"
                  >
                    <i>
                      {data?.get('_private_notes')?.map((note: any) => (
                        <p className="mb0" key={note?.get('value')}>
                          &quot;{note?.get('value')}&quot;
                        </p>
                      ))}
                    </i>
                  </ContentBox>
                )}
                <ContentBox
                  className="mb3"
                  fullHeight={false}
                  subTitle="SNow information"
                >
                  {author?.get('ticket_id') && (
                    <a href={author?.get('ticket_url')} target="_blank">
                      See related ticket #{author?.get('ticket_id')}
                    </a>
                  )}
                </ContentBox>
                <ContentBox
                  fullHeight={false}
                  subTitle="Actions"
                  className="mb3"
                >
                  <div className="flex flex-column items-center">
                    <Button
                      className="mb2 w-75"
                      onClick={() => dispatch(resolveAction(id, 'restart', {}))}
                      loading={actionInProgress === 'restart'}
                    >
                      <SyncOutlined />
                      Restart workflow
                    </Button>
                    <Button
                      className="mb2 w-75"
                      onClick={() =>
                        dispatch(
                          resolveAction(id, 'restart', {
                            restart_current_task: true,
                          })
                        )
                      }
                      loading={actionInProgress === 'restart'}
                    >
                      <RedoOutlined />
                      Restart current step
                    </Button>
                    <Button className="mb2 w-75" type="primary">
                      <a
                        href={`/editor/holdingpen/${data?.get('id')}`}
                        target="_blank"
                      >
                        <EditOutlined />
                        {'  '}
                        Open in Editor
                      </a>
                    </Button>
                    {/* TODO2: change to skip step once it's ready */}
                    <Button
                      className="w-75"
                      onClick={() => {}}
                      loading={actionInProgress === 'skip'}
                    >
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

const stateToProps = (state: RootStateOrAny) => ({
  author: state.holdingpen.get('author'),
  loading: state.holdingpen.get('loading'),
  actionInProgress: state.holdingpen.get('actionInProgress'),
});

export default connect(stateToProps)(AuthorDetailPageContainer);
