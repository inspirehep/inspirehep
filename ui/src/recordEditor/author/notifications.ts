import { notification } from 'antd';

export function notifyEditionInProgress(controlNumber: string) {
  notification.info({
    title: 'In progress',
    description: `Editing author ${controlNumber}`,
  });
}

export function notifyEditionSuccess(controlNumber: string) {
  notification.success({
    title: 'Success',
    description: `Author ${controlNumber} edited successfully`,
  });
}

export function notifyEditionError(error: string) {
  notification.error({
    title: 'Unable to edit author',
    description: error,
  });
}
