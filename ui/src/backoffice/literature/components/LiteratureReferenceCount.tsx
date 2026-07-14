import { Map } from 'immutable';
import React from 'react';

interface LiteratureReferenceCountProps {
  referenceCount: Map<'core' | 'non_core' | 'total', number> | null;

  totalReferences?: number;
}

const LiteratureReferenceCount = ({
  referenceCount,
  totalReferences,
}: LiteratureReferenceCountProps) => {
  if (!referenceCount) return null;

  const core = referenceCount.get('core') ?? 0;
  const nonCore = referenceCount.get('non_core') ?? 0;
  const total = totalReferences ?? referenceCount.get('total');
  const matched = core + nonCore;

  return (
    <p>
      References:{' '}
      <strong>
        {core}/{total}
      </strong>{' '}
      core,{' '}
      <strong>
        {matched}/{total}
      </strong>{' '}
      matched
    </p>
  );
};

export default LiteratureReferenceCount;
