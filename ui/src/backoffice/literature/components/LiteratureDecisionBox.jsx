import AutomaticDecision from './AutomaticDecision';
import LiteratureReferenceCount from './LiteratureReferenceCount';
import LiteratureKeywords from './LiteratureKeywords';
import LiteratureActionButtons from './LiteratureActionButtons';
import LiteratureDecisionDetails from './LiteratureDecisionDetails';
import { LITERATURE } from '../../../common/routes';
import LiteratureControlNumber from './LiteratureControlNumber';

const LiteratureDecisionBox = ({
  classifierResults,
  controlNumber,
  decision,
  handleResolveAction,
  referenceCount,
  relevancePrediction,
  status,
  totalReferences,
  workflowId,
  isFullCoverage,
  shouldShowSubmissionModal = false,
  submissionContext = undefined,
  hasInspireCategories = true,
  disableActions = false,
}) => (
  <div className="literature-decision-box">
    <AutomaticDecision relevancePrediction={relevancePrediction} />
    <div className="mb2">
      <LiteratureActionButtons
        status={status}
        handleResolveAction={handleResolveAction}
        workflowId={workflowId}
        isFullCoverage={isFullCoverage}
        shouldShowSubmissionModal={shouldShowSubmissionModal}
        submissionContext={submissionContext}
        hasInspireCategories={hasInspireCategories}
        disableActions={disableActions}
      />
    </div>
    <LiteratureDecisionDetails decision={decision} />
    <LiteratureControlNumber
      controlNumber={controlNumber}
      pidType={LITERATURE}
    />
    <LiteratureReferenceCount
      referenceCount={referenceCount}
      totalReferences={totalReferences}
    />
    <LiteratureKeywords classifierResults={classifierResults} />
  </div>
);

export default LiteratureDecisionBox;
