import React from 'react';
import { notification } from 'antd';

export function notifyLoginError(error: string) {
  notification.error({
    message: 'Login unsuccessful',
    description: error,
    duration: 2,
  });
}
