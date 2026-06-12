import React from 'react';
import LinkWithTargetBlank from '../../../common/components/LinkWithTargetBlank';

interface LiteratureControlNumberProps {
  controlNumber?: number | null;
  pidType: string;
}

const LiteratureControlNumber = ({
  controlNumber,
  pidType,
}: LiteratureControlNumberProps) => {
  if (!controlNumber) {
    return null;
  }

  return (
    <p>
      Control number:{' '}
      <LinkWithTargetBlank
        href={`${pidType}/${controlNumber}`}
        rel="noopener noreferrer"
      >
        {controlNumber}
      </LinkWithTargetBlank>
    </p>
  );
};

export default LiteratureControlNumber;
