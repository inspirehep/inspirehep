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
import { ActionCreator, Action } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';
import { push } from 'connected-react-router';

import './AuthorDetailPageContainer.less';

import ContentBox from '../../../common/components/ContentBox';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { fetchAuthor, resolveAction } from '../../../actions/backoffice';
import Links from '../../common/components/Links/Links';
import {
  columnsInstitutions,
  columnsProjects,
  columnsSubject,
  columnsAdvisors,
} from './columnData';
import { getConfigFor } from '../../../common/config';
import {
  getWorkflowStatusInfo,
  resolveDecision,
  filterByProperty,
  formatDateTime,
} from '../../utils/utils';
import DeleteWorkflow from '../../common/components/DeleteWorkflow/DeleteWorkflow';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import { AUTHORS, BACKOFFICE_SEARCH } from '../../../common/routes';
import { isSuperUser } from '../../../common/authorization';
import UnclickableTag from '../../../common/components/UnclickableTag';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import PrivateNotes from '../components/PrivateNotes';
import AuthorMainInfo from '../components/AuthorMainInfo';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';

type AuthorDetailPageContainerProps = {
  dispatch: ActionCreator<Action>;
  author: Map<string, any>;
  loading: boolean;
  actionInProgress: string | false;
  isSuperUserLoggedIn: boolean;
};

const AuthorDetailPageContainer = ({
  dispatch,
  author,
  loading,
  actionInProgress,
  isSuperUserLoggedIn,
}: AuthorDetailPageContainerProps) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(fetchAuthor(id));
  }, []);

  const data = author?.get('data');
  const controlNumber = data?.get('control_number');
  const tickets = author?.get('tickets')?.size !== 0 && author?.get('tickets');
  const decision = author?.getIn(['decisions', 0]) as Map<string, any>;
  const status = author?.get('status');
  const statusInfo = status
    ? getWorkflowStatusInfo(status.toLowerCase())
    : null;
  const urls = data?.get('urls');
  const filteredIds = filterByProperty(data, 'ids', 'schema', 'ORCID', false);
  const acquisitionSourceEmail = data?.getIn(['acquisition_source', 'email']);
  const rawDateTime = data?.getIn(['acquisition_source', 'datetime']);

  const formattedDateTime = formatDateTime(rawDateTime);
  const acquisitionSourceDateTime = formattedDateTime
    ? `${formattedDateTime.date} ${formattedDateTime.time}`
    : undefined;

  const privateNotes = data?.get('_private_notes');

  const shouldDisplayDecisionsBox =
    decision || status === 'approval' || (decision && status !== 'approval');

  const DAGS_URL = getConfigFor('INSPIRE_WORKFLOWS_DAGS_URL');

  const OPEN_SECTIONS = [
    data?.get('positions') && 'institutions',
    data?.get('project_membership') && 'projects',
    (urls || filteredIds?.size) && 'links',
    (data?.get('arxiv_categories') || data?.get('advisors')) && 'other',
    status === 'error' && 'errors',
    'delete',
  ].filter(Boolean);

  const handleResolveAction = (value: string) => {
    dispatch(resolveAction(id, 'resolve', { value }));
  };

  return (
    <div
      className="__DetailPageContainer__"
      data-testid="backoffice-detail-page"
    >
      <Breadcrumbs
        title1="Search"
        href1={`${document.referrer}`}
        title2={data?.getIn(['name', 'value']) || 'Details'}
        href2={id}
      />
      <LoadingOrChildren loading={loading}>
        <EmptyOrChildren
          data={author}
          title={
            <>
              Author not found <br />
              <LinkLikeButton onClick={() => dispatch(push(BACKOFFICE_SEARCH))}>
                <p>Go to search page</p>
              </LinkLikeButton>
            </>
          }
        >
          <Row justify="center">
            <Col xs={24} md={22} lg={21} xxl={18}>
              {status && (
                <Row className="mv3" justify="center" gutter={35}>
                  <Col xs={24}>
                    <div
                      className={`bg-${status?.toLowerCase()} ${
                        status === 'error' ? 'white' : ''
                      } w-100`}
                    >
                      <p className="b f3 tc pv2">
                        {statusInfo ? statusInfo.text : 'Unknown Status'}
                      </p>
                    </div>
                  </Col>
                </Row>
              )}
              <Row className="mv3" justify="center" gutter={35}>
                <Col xs={24} lg={16}>
                  {data && <AuthorMainInfo data={data} />}
                  <CollapsableForm openSections={OPEN_SECTIONS}>
                    <CollapsableForm.Section
                      header="Institution History"
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
                      header="Project Membership History"
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
                    {(urls || filteredIds?.size) && (
                      <CollapsableForm.Section header="Links" key="links">
                        <Links urls={urls} ids={filteredIds} />
                      </CollapsableForm.Section>
                    )}
                    <CollapsableForm.Section header="Other" key="other">
                      <Row justify="space-between" gutter={12}>
                        <Col span={12}>
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
                        <Col span={12}>
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
                    {status === 'error' && (
                      <CollapsableForm.Section header="Errors" key="errors">
                        <p>
                          See error details here:{' '}
                          <a
                            href={`${DAGS_URL}${id}`}
                            target="_blank"
                          >{`${DAGS_URL}${id}`}</a>
                        </p>
                      </CollapsableForm.Section>
                    )}
                    <CollapsableForm.Section header="Danger area" key="delete">
                      <DeleteWorkflow id={id} dispatch={dispatch} />
                    </CollapsableForm.Section>
                  </CollapsableForm>
                </Col>
                <Col xs={24} lg={8}>
                  {shouldDisplayDecisionsBox && (
                    <ContentBox
                      className="mb3"
                      fullHeight={false}
                      subTitle="Decision"
                    >
                      {decision ? (
                        <p className="mb0">
                          This workflow is{' '}
                          <UnclickableTag
                            className={`decision-pill ${
                              resolveDecision(decision?.get('action'))?.bg
                            }`}
                          >
                            {resolveDecision(decision?.get('action'))
                              ?.decision || 'completed'}
                          </UnclickableTag>
                          {controlNumber && (
                            <span>
                              as{' '}
                              <LinkWithTargetBlank
                                href={`${AUTHORS}/${controlNumber}`}
                              >
                                {controlNumber}
                              </LinkWithTargetBlank>
                            </span>
                          )}
                        </p>
                      ) : (
                        <div className="w-100 flex flex-column items-center">
                          <Button
                            className="font-white bg-completed w-75 mb2"
                            onClick={() => handleResolveAction('accept')}
                            loading={actionInProgress === 'resolve'}
                          >
                            Accept
                          </Button>
                          <Button
                            className="font-white bg-halted w-75 mb2"
                            onClick={() => handleResolveAction('accept_curate')}
                            loading={actionInProgress === 'resolve'}
                          >
                            Accept + Curation
                          </Button>
                          <Button
                            className="font-white bg-error w-75"
                            onClick={() => handleResolveAction('reject')}
                            loading={actionInProgress === 'resolve'}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </ContentBox>
                  )}
                  <ContentBox
                    className="mb3"
                    fullHeight={false}
                    subTitle="Submission"
                  >
                    Submitted by <i>{acquisitionSourceEmail}</i>
                    {acquisitionSourceDateTime ? (
                      <>
                        {' '}
                        on <b>{acquisitionSourceDateTime}</b>.
                      </>
                    ) : (
                      '.'
                    )}
                  </ContentBox>
                  {privateNotes && <PrivateNotes privateNotes={privateNotes} />}
                  <ContentBox
                    className="mb3"
                    fullHeight={false}
                    subTitle="SNow information"
                  >
                    {tickets && (
                      <p className="mb0">
                        See related ticket
                        <a
                          href={tickets?.first()?.get('ticket_url')}
                          target="_blank"
                        >
                          {' '}
                          #{tickets?.first()?.get('ticket_id')}
                        </a>
                      </p>
                    )}
                  </ContentBox>
                  {isSuperUserLoggedIn && (
                    <ContentBox
                      className="mb3"
                      fullHeight={false}
                      subTitle="Running dags"
                    >
                      <div className="flex flex-column items-center">
                        <Button className="w-75">
                          <a href={`${DAGS_URL}${id}`} target="_blank">
                            See running dags
                          </a>
                        </Button>
                      </div>
                    </ContentBox>
                  )}
                  <ContentBox
                    fullHeight={false}
                    subTitle="Actions"
                    className="mb3"
                  >
                    <div className="flex flex-column items-center">
                      <Button
                        className="mb2 w-75"
                        onClick={() =>
                          dispatch(resolveAction(id, 'restart', {}))
                        }
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
                        <a href={`/editor/backoffice/authors/${id}`}>
                          <EditOutlined />
                          {'  '}
                          Open in Editor
                        </a>
                      </Button>
                    </div>
                  </ContentBox>
                </Col>
              </Row>
            </Col>
          </Row>
        </EmptyOrChildren>
      </LoadingOrChildren>
    </div>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  author: state.backoffice.get('author'),
  loading: state.backoffice.get('loading'),
  actionInProgress: state.backoffice.get('actionInProgress'),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(AuthorDetailPageContainer);
