import React from 'react';

const LiteratureReferenceCount = ({ referenceCount, totalReferences }) => {
  if (!referenceCount) return null;

  const core = referenceCount.get('core');
  const nonCore = referenceCount.get('non_core');
  const matched = core + nonCore;

  return (
    <p>
      References:{' '}
      <strong>
        {core}/{totalReferences}
      </strong>{' '}
      core,{' '}
      <strong>
        {matched}/{totalReferences}
      </strong>{' '}
      matched
    </p>
  );
};

export default LiteratureReferenceCount;
