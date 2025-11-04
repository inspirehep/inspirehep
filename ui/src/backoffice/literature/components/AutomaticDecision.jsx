import React from 'react';
import { resolveAutomaticDecision } from '../../utils/utils';

const AutomaticDecision = ({ inspireCategories, relevancePrediction }) => {
  const hasInspireCategories =
    Array.isArray(inspireCategories) && inspireCategories.length > 0;

  if (!hasInspireCategories || !relevancePrediction) return null;

  const decision = relevancePrediction.get('decision');
  const maxScore = relevancePrediction.get('max_score');

  const resolvedAutomaticDecision = resolveAutomaticDecision(decision);
  const scoreText =
    typeof maxScore === 'number' ? ` ${maxScore.toFixed(2)}` : '';

  return (
    <p>
      Automatic Decision:{' '}
      <span className={resolvedAutomaticDecision?.class}>
        {resolvedAutomaticDecision?.text}
        {scoreText}
      </span>
    </p>
  );
};

export default AutomaticDecision;
