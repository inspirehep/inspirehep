import { notification } from 'antd';
import _ from 'lodash';
import { WorkflowActions } from './constants';

export function notifyLoginError(error: string) {
  notification.error({
    title: 'Login unsuccessful',
    description: error,
    duration: 7,
  });
}

export function notifyActionSuccess(action: string) {
  const displayAction =
    action === WorkflowActions.RESOLVE ? 'decision' : action;

  notification.success({
    title: 'Success',
    description: `${_.capitalize(displayAction)} performed successfully`,
  });
}

export function notifyActionError(error: string) {
  notification.error({
    title: 'Unable to perform action',
    description: error,
  });
}

export function notifyDeleteSuccess() {
  notification.success({
    title: 'Success',
    description: 'Workflow deleted successfully',
  });
}

export function notifyDeleteError(error: string) {
  notification.error({
    title: 'Unable to delete workflow',
    description: error,
  });
}
