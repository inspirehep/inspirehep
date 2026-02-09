import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Table } from 'antd';
import { ActionCreator, Action } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';
import { push } from 'connected-react-router';

import './AuthorDetailPageContainer.less';

import ContentBox from '../../../common/components/ContentBox';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import {
  deleteWorkflow,
  fetchAuthor,
  resolveAuthorAction,
  restartWorkflowAction,
  restartCurrentWorkflowAction,
} from '../../../actions/backoffice';
import Links from '../../common/components/Links/Links';
import {
  columnsInstitutions,
  columnsProjects,
  columnsSubject,
  columnsAdvisors,
} from './columnData';
import { getConfigFor } from '../../../common/config';
import {
  resolveDecision,
  filterByProperty,
  formatDateTime,
  getDag,
} from '../../utils/utils';
import DeleteWorkflow from '../../common/components/DeleteWorkflow/DeleteWorkflow';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import { AUTHORS, BACKOFFICE_AUTHORS_SEARCH } from '../../../common/routes';
import { isSuperUser } from '../../../common/authorization';
import UnclickableTag from '../../../common/components/UnclickableTag';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import PrivateNotes from '../components/PrivateNotes';
import AuthorMainInfo from '../components/AuthorMainInfo';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';
import { BACKOFFICE_AUTHORS_SEARCH_NS } from '../../../search/constants';
import { AUTHORS_PID_TYPE } from '../../../common/constants';
import { StatusBanner } from '../../common/components/Detail/StatusBanner';
import { TicketsList } from '../../common/components/Detail/TicketsList';
import { RestartActionButtons } from '../../common/components/Detail/RestartActionButtons';
import { WorkflowStatuses } from '../../constants';
import { AuthorActionButtons } from '../components/AuthorActionButtons';

type AuthorDetailPageContainerProps = {
  dispatch: ActionCreator<Action>;
  author: Map<string, any>;
  loading: boolean;
  actionInProgress: Map<string, any> | null;
  restartActionInProgress: Map<string, any> | null;
  isSuperUserLoggedIn: boolean;
};

const AuthorDetailPageContainer = ({
  dispatch,
  author,
  loading,
  actionInProgress,
  restartActionInProgress,
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
  const workflow_type = author?.get('workflow_type');
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
    decision || status === WorkflowStatuses.APPROVAL;

  const DAGS_URL = getConfigFor('INSPIRE_WORKFLOWS_DAGS_URL');
  const DAG_FULL_URL = `${DAGS_URL}${getDag(workflow_type)}/runs/${id}`;

  const OPEN_SECTIONS = [
    data?.get('positions') && 'institutions',
    data?.get('project_membership') && 'projects',
    (urls || filteredIds?.size) && 'links',
    (data?.get('arxiv_categories') || data?.get('advisors')) && 'other',
    status === WorkflowStatuses.ERROR && 'errors',
    'delete',
  ].filter(Boolean);

  const handleResolveAction = (value: string) => {
    dispatch(resolveAuthorAction(id, { value }));
  };

  const handleRestart = () => {
    dispatch(restartWorkflowAction(id, AUTHORS_PID_TYPE));
  };

  const handleRestartCurrent = () => {
    dispatch(restartCurrentWorkflowAction(id, AUTHORS_PID_TYPE));
  };

  const handleDelete = () => {
    dispatch(deleteWorkflow(AUTHORS_PID_TYPE, id));
  };

  return (
    <div
      className="__AuthorDetailPageContainer__"
      data-testid="backoffice-detail-page"
    >
      <Breadcrumbs
        title1="Search authors"
        href1="authors/search"
        title2={data?.getIn(['name', 'value']) || 'Details'}
        namespace={BACKOFFICE_AUTHORS_SEARCH_NS}
      />
      <LoadingOrChildren loading={loading}>
        <EmptyOrChildren
          data={author}
          title={
            <>
              Author not found <br />
              <LinkLikeButton
                onClick={() => dispatch(push(BACKOFFICE_AUTHORS_SEARCH))}
              >
                <p>Go to search page</p>
              </LinkLikeButton>
            </>
          }
        >
          <Row justify="center">
            <Col xs={24} md={22} lg={21} xxl={18}>
              <StatusBanner status={status} />
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
                      <CollapsableForm.Section
                        header="Identifiers & Links"
                        key="links"
                      >
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
                    {status === WorkflowStatuses.ERROR && (
                      <CollapsableForm.Section header="Errors" key="errors">
                        <p>
                          See error details here:{' '}
                          <a href={DAG_FULL_URL} target="_blank">
                            {DAG_FULL_URL}
                          </a>
                        </p>
                      </CollapsableForm.Section>
                    )}
                    <CollapsableForm.Section header="Danger area" key="delete">
                      <DeleteWorkflow onConfirm={handleDelete} />
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
                        <AuthorActionButtons
                          actionInProgress={actionInProgress}
                          handleResolveAction={handleResolveAction}
                          workflowId={id}
                        />
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
                    <TicketsList tickets={tickets} />
                  </ContentBox>
                  {isSuperUserLoggedIn && (
                    <ContentBox
                      className="mb3"
                      fullHeight={false}
                      subTitle="Running dags"
                    >
                      <div className="flex flex-column items-center">
                        <Button className="w-75">
                          <a href={DAG_FULL_URL} target="_blank">
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
                    <RestartActionButtons
                      handleRestart={handleRestart}
                      handleRestartCurrent={handleRestartCurrent}
                      id={id}
                      pidType={AUTHORS_PID_TYPE}
                      restartActionInProgress={restartActionInProgress}
                      status={status}
                    />
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
  restartActionInProgress: state.backoffice.get('restartActionInProgress'),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(AuthorDetailPageContainer);
