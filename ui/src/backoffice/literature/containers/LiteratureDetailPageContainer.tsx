import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ActionCreator, Action } from 'redux';
import { connect, RootStateOrAny } from 'react-redux';
import { Map } from 'immutable';
import { push } from 'connected-react-router';

import './LiteratureDetailPageContainer.less';

import { Button, Col, Row, Table } from 'antd';
import { EditOutlined, RedoOutlined, SyncOutlined } from '@ant-design/icons';
import {
  deleteWorkflow,
  fetchLiteratureRecord,
  resolveAction,
} from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import { BACKOFFICE_LITERATURE_SEARCH } from '../../../common/routes';
import ContentBox from '../../../common/components/ContentBox';
import { BACKOFFICE_LITERATURE_SEARCH_NS } from '../../../search/constants';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';
import { formatDateTime, getDag } from '../../utils/utils';
import { isSuperUser } from '../../../common/authorization';
import { columnsSubject } from './columnData';
import { StatusBanner } from '../../common/components/Detail/StatusBanner';
import { TicketsList } from '../../common/components/Detail/TicketsList';
import { LITERATURE_PID_TYPE } from '../../../common/constants';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import DeleteWorkflow from '../../common/components/DeleteWorkflow/DeleteWorkflow';
import { getConfigFor } from '../../../common/config';
import LiteratureMainInfo from '../components/LiteratureMainInfo';
import Links from '../../common/components/Links/Links';
import LiteratureDecisionBox from '../components/LiteratureDecisionBox';

type LiteratureDetailPageContainerProps = {
  dispatch: ActionCreator<Action>;
  literature: Map<string, any>;
  loading: boolean;
  actionInProgress: string | false;
  isSuperUserLoggedIn: boolean;
};

const LiteratureDetailPageContainer = ({
  dispatch,
  literature,
  loading,
  actionInProgress,
  isSuperUserLoggedIn,
}: LiteratureDetailPageContainerProps) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(fetchLiteratureRecord(id));
  }, []);

  const data = literature?.get('data');
  const relevancePrediction = literature?.get('relevance_prediction');
  const referenceCount = literature?.get('reference_count');
  const title = data?.getIn(['titles', 0, 'title']);
  const controlNumber = data?.get('control_number');
  const tickets =
    literature?.get('tickets')?.size !== 0 && literature?.get('tickets');
  const decision = literature?.getIn(['decisions', 0]) as Map<string, any>;
  const status = literature?.get('status');
  const workflow_type = literature?.get('workflow_type');
  const inspireCategories = data?.get('inspire_categories')?.toJS();
  const rawDateTime = data?.getIn(['acquisition_source', 'datetime']);
  const urls = data?.get('urls');
  const ids = data?.get('ids');
  const references = data?.get('references');
  const totalReferences = references ? references.size : 0;

  const formattedDateTime = formatDateTime(rawDateTime);
  const acquisitionSourceDateTime = formattedDateTime
    ? `${formattedDateTime.date} ${formattedDateTime.time}`
    : undefined;
  const acquisitionSourceSource = data?.getIn(['acquisition_source', 'source']);
  const acquisitionSourceMethod = data?.getIn(['acquisition_source', 'method']);

  const shouldDisplayDecisionsBox = decision || status === 'approval';

  const DAGS_URL = getConfigFor('INSPIRE_WORKFLOWS_DAGS_URL');
  const DAG_FULL_URL = `${DAGS_URL}${getDag(workflow_type)}/runs/${id}`;

  const OPEN_SECTIONS = [
    (urls || ids) && 'links',
    inspireCategories && 'subjectAreas',
    status === 'error' && 'errors',
    'delete',
  ].filter(Boolean);

  const handleResolveAction = (value: string) => {
    dispatch(resolveAction(id, LITERATURE_PID_TYPE, 'resolve', { value }));
  };

  const handleDelete = () => {
    dispatch(deleteWorkflow(LITERATURE_PID_TYPE, id));
  };

  return (
    <>
      <DocumentHead
        title={`${title} - Backoffice`}
        description="Explore detailed information about the record."
      />
      <div
        className="__DetailPageContainer__"
        data-testid="backoffice-detail-page"
      >
        <Breadcrumbs
          title1="Search literature"
          href1="literature/search"
          title2={title || 'Details'}
          namespace={BACKOFFICE_LITERATURE_SEARCH_NS}
        />
        <LoadingOrChildren loading={loading}>
          <EmptyOrChildren
            data={literature}
            title={
              <>
                Record not found <br />
                <LinkLikeButton
                  onClick={() => dispatch(push(BACKOFFICE_LITERATURE_SEARCH))}
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
                    {data && <LiteratureMainInfo data={data} />}
                    <CollapsableForm openSections={OPEN_SECTIONS}>
                      {(urls || ids) && (
                        <CollapsableForm.Section
                          header="Identifiers & Links"
                          key="links"
                        >
                          <Links urls={urls} ids={ids} />
                        </CollapsableForm.Section>
                      )}
                      <CollapsableForm.Section
                        header="Subject areas"
                        key="subjectAreas"
                      >
                        <Table
                          columns={columnsSubject}
                          dataSource={inspireCategories}
                          pagination={false}
                          size="small"
                          rowKey={(record) =>
                            `${record?.term}+${Math.random()}`
                          }
                        />
                      </CollapsableForm.Section>
                      {status === 'error' && (
                        <CollapsableForm.Section header="Errors" key="errors">
                          <p>
                            See error details here:{' '}
                            <a href={DAG_FULL_URL} target="_blank">
                              {DAG_FULL_URL}
                            </a>
                          </p>
                        </CollapsableForm.Section>
                      )}
                      <CollapsableForm.Section
                        header="Danger area"
                        key="delete"
                      >
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
                          <LiteratureDecisionBox
                            decision={decision}
                            controlNumber={controlNumber}
                            inspireCategories={inspireCategories}
                            relevancePrediction={relevancePrediction}
                            referenceCount={referenceCount}
                            totalReferences={totalReferences}
                          />
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
                              onClick={() =>
                                handleResolveAction('accept_curate')
                              }
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
                      <>
                        Harvested on <b>{acquisitionSourceDateTime}</b> from{' '}
                        <b>{acquisitionSourceSource}</b> using{' '}
                        <b> {acquisitionSourceMethod}</b>
                      </>
                    </ContentBox>
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
                      <div className="flex flex-column items-center">
                        <Button
                          className="mb2 w-75"
                          onClick={() =>
                            dispatch(
                              resolveAction(
                                id,
                                LITERATURE_PID_TYPE,
                                'restart',
                                {}
                              )
                            )
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
                              resolveAction(
                                id,
                                LITERATURE_PID_TYPE,
                                'restart',
                                {
                                  restart_current_task: true,
                                }
                              )
                            )
                          }
                          loading={actionInProgress === 'restart'}
                        >
                          <RedoOutlined />
                          Restart current step
                        </Button>
                        <Button className="mb2 w-75" type="primary">
                          <a
                            href={`/editor/backoffice/${LITERATURE_PID_TYPE}/${id}`}
                          >
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
    </>
  );
};

const stateToProps = (state: RootStateOrAny) => ({
  literature: state.backoffice.get('literature'),
  loading: state.backoffice.get('loading'),
  actionInProgress: state.backoffice.get('actionInProgress'),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
});

export default connect(stateToProps)(LiteratureDetailPageContainer);
