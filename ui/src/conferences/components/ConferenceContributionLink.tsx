import React from 'react';
import { LoginOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import IconText from '../../common/components/IconText';
import UserAction from '../../common/components/UserAction';
import { LITERATURE } from '../../common/routes';
import { pluralizeUnlessSingle } from '../../common/utils';
import { getContributionsQueryString } from '../utils';

const ConferenceContributionLink = ({
  recordId,
  contributionsCount,
}: {
  recordId: string;
  contributionsCount: number;
}) => {
  return (
    <UserAction>
      <Link
        to={`${LITERATURE}?q=${getContributionsQueryString(
          recordId
        )}&doc_type=conference%20paper`}
      >
        <IconText
          text={`${contributionsCount} ${pluralizeUnlessSingle(
            'contribution',
            contributionsCount
          )}`}
          icon={<LoginOutlined />}
        />
      </Link>
    </UserAction>
  );
};

export default ConferenceContributionLink;
