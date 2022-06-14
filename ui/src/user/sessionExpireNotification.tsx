import React from 'react';
import { notification } from 'antd';

import { USER_LOGIN } from '../common/routes';

export default function notifySessionExpired() {
  notification.error({
    message: 'You are logged out due to inactivity.',
    duration: null,
    description: <a href={`${USER_LOGIN}`}>Go to login page.</a>,
  });
}
