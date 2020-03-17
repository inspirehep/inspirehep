import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'antd';
import RouterLinkButton from '../../common/components/RouterLinkButton';

function SubmissionCard({ title, children, formLink }) {
  const actions = useMemo(
    () => [
      <RouterLinkButton key="submit" to={formLink}>
        Submit
      </RouterLinkButton>,
    ],
    [formLink]
  );
  return (
    <Card title={title} actions={actions}>
      {children}
    </Card>
  );
}

SubmissionCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  formLink: PropTypes.string.isRequired,
};

export default SubmissionCard;
