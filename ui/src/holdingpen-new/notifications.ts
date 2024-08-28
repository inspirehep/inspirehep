import React from 'react';
import { notification } from 'antd';
import _ from 'lodash';

export function notifyLoginError(error: string) {
  notification.error({
    message: 'Login unsuccessful',
    description: error,
    duration: 7,
  });
}

export function notifyActionSuccess(action: string) {
  notification.success({
    message: 'Success',
    description: `${_.capitalize(action)} performed successfully`,
    duration: 10,
  });
}

export function notifyActionError(error: string) {
  notification.error({
    message: 'Unable to perform action',
    description: error,
    duration: 10,
  });
}

export function notifyDeleteSuccess() {
  notification.success({
    message: 'Success',
    description: 'Workflow deleted successfully',
    duration: 10,
  });
}

export function notifyDeleteError(error: string) {
  notification.error({
    message: 'Unable to delete workflow',
    description: error,
    duration: 10,
  });
}
