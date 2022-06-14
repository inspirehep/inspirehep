import React, { useMemo } from 'react';
import { Card } from 'antd';
import RouterLinkButton from '../../common/components/RouterLinkButton';

const TEXT_CENTER = { textAlign: 'center' };

type Props = {
    title: string;
    children: React.ReactNode;
    formLink: string;
};

function SubmissionCard({ title, children, formLink }: Props) {
  const actions = useMemo(
    () => [
      <RouterLinkButton key="submit" to={formLink}>
        Submit
      </RouterLinkButton>,
    ],
    [formLink]
  );
  return (
    // @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
    <Card
      title={title}
      actions={actions}
      headStyle={TEXT_CENTER}
      bodyStyle={TEXT_CENTER}
    >
      {children}
    </Card>
  );
}

export default SubmissionCard;
