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
import { getConfigFor } from '../../../common/config';
import { resolveDecision } from '../../utils/utils';
import DeleteWorkflow from '../../components/DeleteWorkflow/DeleteWorkflow';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import { HOLDINGPEN_SEARCH_NEW } from '../../../common/routes';

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

  const data = author?.get('data');
  const tickets = author?.get('tickets')?.size !== 0 && author?.get('tickets');
  const decision = author?.getIn(['decisions', 0]) as Map<string, any>;
  const status = author?.get('status');

  const shouldDisplayDecisionsBox =
    decision || status === 'approval' || (decision && status !== 'approval');

  const ERRORS_URL = getConfigFor('INSPIRE_WORKFLOWS_DAGS_URL');

  const OPEN_SECTIONS = [
    data?.get('positions') && 'institutions',
    data?.get('project_membership') && 'projects',
    (data?.get('urls') || data?.get('ids')) && 'links',
    (data?.get('arxiv_categories') || data?.get('advisors')) && 'other',
    status === 'error' && 'errors',
    'delete',
  ].filter(Boolean);

  const handleResolveAction = (value: string, createTicket = false) => {
    dispatch(
      resolveAction(id, 'resolve', { value, create_ticket: createTicket })
    );
  };

  return (
    <div
      className="__DetailPageContainer__"
      data-testid="holdingpen-detail-page"
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
              <LinkLikeButton
                onClick={() => dispatch(push(HOLDINGPEN_SEARCH_NEW))}
              >
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
                      <p className="b f3 tc pv2">{status?.toUpperCase()}</p>
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
                      <p className="mb0">
                        <b>Status:</b> {data?.get('status')}
                      </p>
                    )}
                    {data
                      ?.get('ids')
                      ?.find(
                        (id: { get: (arg0: string) => string }) =>
                          id.get('schema') === 'ORCID'
                      ) && (
                      <Ids
                        ids={data
                          ?.get('ids')
                          ?.filter(
                            (id: { get: (arg0: string) => string }) =>
                              id?.get('schema') === 'ORCID'
                          )}
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
                        <Links
                          urls={data?.get('urls')}
                          ids={data?.get('ids')}
                        />
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
                    {status === 'error' && (
                      <CollapsableForm.Section header="Errors" key="errors">
                        <p>
                          See error details here:{' '}
                          <a
                            href={`${ERRORS_URL}/${id}`}
                            target="_blank"
                          >{`${ERRORS_URL}/${id}`}</a>
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
                      {!decision ? (
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
                      ) : (
                        <p className="mb0">
                          This workflow is{' '}
                          <b>
                            {resolveDecision(decision?.get('action'))
                              ?.decision || 'completed'}
                          </b>
                          .
                        </p>
                      )}
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
                        data?.getIn(['acquisition_source', 'datetime'])
                      )?.toLocaleDateString()}
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
                        {data
                          ?.get('_private_notes')
                          ?.map(
                            (note: {
                              get: (arg0: string) => {} | null | undefined;
                            }) => (
                              <p
                                className="mb0"
                                key={note?.get('value') as string}
                              >
                                &quot;{note?.get('value')}&quot;
                              </p>
                            )
                          )}
                      </i>
                    </ContentBox>
                  )}
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
                        <a
                          href={`/editor/holdingpen/${data?.get('id')}`}
                          target="_blank"
                        >
                          <EditOutlined />
                          {'  '}
                          Open in Editor
                        </a>
                      </Button>
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
        </EmptyOrChildren>
      </LoadingOrChildren>
    </div>
  );
};

const mapStateToProps = (state: RootStateOrAny) => ({
  author: state.holdingpen.get('author'),
  loading: state.holdingpen.get('loading'),
  actionInProgress: state.holdingpen.get('actionInProgress'),
});

export default connect(mapStateToProps)(AuthorDetailPageContainer);
