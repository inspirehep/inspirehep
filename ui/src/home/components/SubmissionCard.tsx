import React, { useMemo } from 'react';
import { Card } from 'antd';
import RouterLinkButton from '../../common/components/RouterLinkButton';

const TEXT_CENTER: Record<string | number, string & {}> = {
  textAlign: 'center',
};

function SubmissionCard({
  title,
  children,
  formLink,
}: {
  title: string;
  children: JSX.Element | JSX.Element[];
  formLink: string;
}) {
  const actions = useMemo(
    () => [
      <RouterLinkButton key="submit" to={formLink}>
        Submit
      </RouterLinkButton>,
    ],
    [formLink]
  );
  return (
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
