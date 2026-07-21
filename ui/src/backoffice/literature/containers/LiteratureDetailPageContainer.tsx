import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ActionCreator, Action } from 'redux';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { push } from 'redux-first-history';

import './LiteratureDetailPageContainer.less';

import { Alert, Col, Row } from 'antd';
import { RootState } from '../../../types';
import { RestartActionButtons } from '../../common/components/Detail/RestartActionButtons';
import {
  deleteWorkflow,
  fetchLiteratureRecord,
  resolveLiteratureAction,
  restartWorkflowAction,
  restartCurrentWorkflowAction,
} from '../../../actions/backoffice';
import EmptyOrChildren from '../../../common/components/EmptyOrChildren';
import LinkLikeButton from '../../../common/components/LinkLikeButton/LinkLikeButton';
import LoadingOrChildren from '../../../common/components/LoadingOrChildren';
import RunningDagsBox from '../../../common/components/RunningDagsBox';
import { BACKOFFICE_LITERATURE_SEARCH } from '../../../common/routes';
import ContentBox from '../../../common/components/ContentBox';
import { BACKOFFICE_LITERATURE_SEARCH_NS } from '../../../search/constants';
import Breadcrumbs from '../../common/components/Breadcrumbs/Breadcrumbs';
import DocumentHead from '../../../common/components/DocumentHead';
import {
  filterDecisions,
  formatDateTime,
  getDag,
  isFullCoverageWorkflow,
  isLiteratureUpdateWorkflow,
} from '../../utils/utils';
import { isSuperUser } from '../../../common/authorization';
import { StatusBanner } from '../../common/components/Detail/StatusBanner';
import { TicketsList } from '../../common/components/Detail/TicketsList';
import { LITERATURE_PID_TYPE } from '../../../common/constants';
import CollapsableForm from '../../../submissions/common/components/CollapsableForm';
import DeleteWorkflow from '../../common/components/DeleteWorkflow/DeleteWorkflow';
import { getConfigFor } from '../../../common/config';
import LiteratureMainInfo from '../components/LiteratureMainInfo';
import Links from '../../common/components/Links/Links';
import LiteratureDecisionBox from '../components/LiteratureDecisionBox';
import LiteratureReferences from '../components/LiteratureReferences';
import LiteratureMatches from '../components/LiteratureMatches';
import ExactMatchesCallout from '../components/ExactMatchesCallout';
import {
  WorkflowActions,
  WorkflowStatuses,
  WorkflowTypes,
} from '../../constants';
import SubjectArea from '../components/SubjectArea';

type LiteratureDetailPageContainerProps = {
  dispatch: ActionCreator<Action>;
  literature: Map<string, any>;
  loading: boolean;
  restartActionInProgress: Map<string, any> | null;
  isSuperUserLoggedIn: boolean;
  actionInProgress: Map<string, any> | null;
};

const LiteratureDetailPageContainer = ({
  dispatch,
  literature,
  loading,
  restartActionInProgress,
  isSuperUserLoggedIn,
  actionInProgress,
}: LiteratureDetailPageContainerProps) => {
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    dispatch(fetchLiteratureRecord(id!));
  }, []);

  const workflowType = literature?.get('workflow_type');
  const isLiteratureUpdate = isLiteratureUpdateWorkflow(workflowType);
  const data = literature?.get('data');
  const relevancePrediction = literature?.get('relevance_prediction');
  const referenceCount = literature?.get('reference_count');
  const classifierResults = literature?.get('classifier_results');
  const matches = literature?.get('matches');
  const exactMatches = matches?.get('exact');
  const fuzzyMatches = matches?.get('fuzzy');
  const status = literature?.get('status');
  const hasExactMatches =
    !!exactMatches?.size &&
    status === WorkflowStatuses.ERROR_MULTIPLE_EXACT_MATCHES;
  const hasFuzzyMatches =
    !!fuzzyMatches?.size && status === WorkflowStatuses.APPROVAL_FUZZY_MATCHING;
  const title = data?.getIn(['titles', 0, 'title']);
  const acquisitionSourceEmail = data?.getIn(['acquisition_source', 'email']);
  const controlNumber = data?.get('control_number');
  const tickets =
    literature?.get('tickets')?.size !== 0 && literature?.get('tickets');
  const decisions = literature?.get('decisions');
  const filteredDecisions = filterDecisions(decisions);
  const decision = filteredDecisions?.first();
  const journalCoverage = literature?.get('journal_coverage');
  const isFullCoverage = isFullCoverageWorkflow(workflowType, journalCoverage);
  const shouldShowSubmissionModal =
    workflowType === WorkflowTypes.HEP_SUBMISSION &&
    status === WorkflowStatuses.APPROVAL;
  const submissionContext: any = shouldShowSubmissionModal
    ? { email: acquisitionSourceEmail, title }
    : undefined;
  const inspireCategoriesImmutable = data?.get('inspire_categories');

  const inspireCategories = useMemo(
    () => inspireCategoriesImmutable?.toJS() ?? [],
    [inspireCategoriesImmutable]
  );
  const hasInspireCategories = !!inspireCategories?.length;
  const rawDateTime = data?.getIn(['acquisition_source', 'datetime']);
  const urls = data?.get('urls');
  const ids = data?.get('ids');
  const references = data?.get('references')?.toJS();
  const rawReferences = literature?.getIn(['form_data', 'references']);
  const totalReferences =
    references && Array.isArray(references) ? references.length : 0;

  const formattedDateTime = formatDateTime(rawDateTime);
  const acquisitionSourceDateTime = formattedDateTime
    ? `${formattedDateTime.date} ${formattedDateTime.time}`
    : undefined;
  const acquisitionSourceSource = data?.getIn(['acquisition_source', 'source']);
  const acquisitionSourceMethod = data?.getIn(['acquisition_source', 'method']);
  const privateNotes = data?.get('_private_notes');

  const DAGS_URL = getConfigFor('INSPIRE_WORKFLOWS_DAGS_URL');
  const DAG_FULL_URL = `${DAGS_URL}${getDag(workflowType)}/runs/${id}`;

  const OPEN_SECTIONS = [
    (urls || ids) && 'links',
    inspireCategories && 'subjectAreas',
    references && 'references',
    status === WorkflowStatuses.ERROR && 'errors',
    hasFuzzyMatches && 'matches',
    'delete',
  ].filter(Boolean);

  const isUpdatingSubjects =
    actionInProgress?.get('type') === WorkflowActions.UPDATE;

  const handleResolveAction = async (action: string, value: string) => {
    dispatch(resolveLiteratureAction(id!, { action, value }));
  };

  const handleRestart = () => {
    dispatch(restartWorkflowAction(id!, LITERATURE_PID_TYPE));
  };

  const handleRestartCurrent = () => {
    dispatch(restartCurrentWorkflowAction(id!, LITERATURE_PID_TYPE));
  };

  const handleDelete = () => {
    dispatch(deleteWorkflow(LITERATURE_PID_TYPE, id!));
  };

  return (
    <>
      <DocumentHead
        title={`${title} - Backoffice`}
        description="Explore detailed information about the record."
      />
      <div
        className="__LiteratureDetailPageContainer__"
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
                {hasExactMatches && (
                  <ExactMatchesCallout exactMatches={exactMatches} />
                )}
                <Row className="mv3" justify="center" gutter={35}>
                  <Col xs={24} lg={16}>
                    {data && (
                      <LiteratureMainInfo
                        data={data}
                        isLiteratureUpdate={isLiteratureUpdate}
                        page="Backoffice literature detail page"
                      />
                    )}
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
                        <SubjectArea
                          workflowId={id!}
                          status={status}
                          inspireCategories={inspireCategories}
                          disableActions={isUpdatingSubjects}
                        />
                      </CollapsableForm.Section>
                      {totalReferences && (
                        <CollapsableForm.Section
                          header="References"
                          key="references"
                        >
                          <LiteratureReferences
                            references={references}
                            rawReferences={rawReferences}
                          />
                        </CollapsableForm.Section>
                      )}
                      {status === WorkflowStatuses.ERROR && (
                        <CollapsableForm.Section header="Errors" key="errors">
                          <p>
                            See error details here:{' '}
                            <a
                              href={DAG_FULL_URL}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {DAG_FULL_URL}
                            </a>
                          </p>
                        </CollapsableForm.Section>
                      )}
                      {hasFuzzyMatches && (
                        <CollapsableForm.Section
                          header="Matches Found"
                          key="matches"
                        >
                          <LiteratureMatches
                            fuzzyMatches={fuzzyMatches}
                            handleResolveAction={handleResolveAction}
                          />
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
                    <ContentBox
                      className="mb3"
                      fullHeight={false}
                      subTitle="Decision"
                    >
                      <LiteratureDecisionBox
                        handleResolveAction={handleResolveAction}
                        status={status}
                        decision={decision}
                        controlNumber={controlNumber}
                        relevancePrediction={relevancePrediction}
                        referenceCount={referenceCount}
                        totalReferences={totalReferences}
                        classifierResults={classifierResults}
                        workflowId={id}
                        isFullCoverage={isFullCoverage}
                        shouldShowSubmissionModal={shouldShowSubmissionModal}
                        submissionContext={submissionContext}
                        hasInspireCategories={hasInspireCategories}
                        disableActions={isUpdatingSubjects}
                      />
                    </ContentBox>
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
                    {privateNotes?.size > 0 && (
                      <ContentBox
                        className="mb3"
                        fullHeight={false}
                        subTitle="Notes"
                      >
                        {privateNotes.map((note: Map<string, any>) =>
                          note.get('value') === '*Temporary entry*' ? (
                            <Alert
                              key={note.get('value')}
                              type="warning"
                              message={note.get('value')}
                              showIcon
                            />
                          ) : (
                            <p key={note.get('value')}>{note.get('value')}</p>
                          )
                        )}
                      </ContentBox>
                    )}
                    <ContentBox
                      className="mb3"
                      fullHeight={false}
                      subTitle="SNow information"
                    >
                      <TicketsList tickets={tickets} />
                    </ContentBox>
                    {isSuperUserLoggedIn && (
                      <RunningDagsBox dagFullUrl={DAG_FULL_URL} />
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
                        pidType={LITERATURE_PID_TYPE}
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
    </>
  );
};

const stateToProps = (state: RootState) => ({
  literature: state.backoffice.get('literature'),
  loading: state.backoffice.get('loading'),
  restartActionInProgress: state.backoffice.get('restartActionInProgress'),
  isSuperUserLoggedIn: isSuperUser(state.user.getIn(['data', 'roles'])),
  actionInProgress: state.backoffice.get('actionInProgress'),
});

export default connect(stateToProps)(LiteratureDetailPageContainer);
