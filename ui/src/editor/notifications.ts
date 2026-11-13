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

export function notifyRevertToRevisionError(error: string) {
  notification.error({
    title: 'Unable to revert to revision',
    description: error,
  });
}

export function notifyCreateTicketError(error: string) {
  notification.error({
    title: 'Unable to create ticket',
    description: error,
  });
}

export function notifyResolveTicketError(error: string) {
  notification.error({
    title: 'Unable to resolve ticket',
    description: error,
  });
}

export function notifyParallelEdition(message: string) {
  notification.warning({
    description: message,
    duration: false,
    placement: 'bottomRight',
  });
}

const DOCUMENT_UPLOAD_NOTIFICATION_KEY = 'editor-document-upload';

export function notifyDocumentUploadInProgress(filename: string) {
  notification.info({
    key: DOCUMENT_UPLOAD_NOTIFICATION_KEY,
    title: 'In progress',
    description: `Uploading ${filename}`,
  });
}

export function notifyDocumentUploadSuccess(filename: string) {
  notification.success({
    key: DOCUMENT_UPLOAD_NOTIFICATION_KEY,
    title: 'Success',
    description: `${filename} uploaded successfully`,
  });
}

export function notifyDocumentUploadError(error: string) {
  notification.error({
    key: DOCUMENT_UPLOAD_NOTIFICATION_KEY,
    title: 'Unable to upload the file',
    description: error,
  });
}
