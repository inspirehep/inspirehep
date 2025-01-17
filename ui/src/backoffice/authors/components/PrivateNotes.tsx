import React from 'react';
import ContentBox from '../../../common/components/ContentBox';

type PrivateNotesProps = {
  privateNotes: { get: (arg0: string) => {} | null | undefined }[]; // TODO: define proper type for privateNotes
};

const PrivateNotes = ({ privateNotes }: PrivateNotesProps) => (
  <ContentBox className="mb3" fullHeight={false} subTitle="Notes">
    <i>
      {privateNotes.map((note) => {
        const value = note?.get('value');
        return (
          <p className="mb0" key={value as string}>
            &quot;{value}&quot;
          </p>
        );
      })}
    </i>
  </ContentBox>
);

export default PrivateNotes;
