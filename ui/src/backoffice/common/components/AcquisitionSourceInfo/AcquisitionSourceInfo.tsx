import React from 'react';

type AcquisitionSourceInfoProps = {
  datetime?: { date: string; time: string } | null;
  source?: string | null;
  email?: string | null;
};

const AcquisitionSourceInfo = ({
  datetime,
  source,
  email,
}: AcquisitionSourceInfoProps) => (
  <>
    {datetime && (
      <p className="waiting">
        {datetime.date} at {datetime.time}
      </p>
    )}
    {source && <p className="waiting">{source}</p>}
    {email && <p className="waiting mb0">{email}</p>}
  </>
);

export default AcquisitionSourceInfo;
