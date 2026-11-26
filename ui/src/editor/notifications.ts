import { notification } from 'antd';

import { PidType } from '../types';

const RECORD_TYPE_LABELS: Partial<Record<PidType, string>> = {
  authors: 'Author',
  literature: 'Literature',
};

function recordLabel(type: PidType) {
  return RECORD_TYPE_LABELS[type] ?? type;
}

export function notifyEditionInProgress(controlNumber: string, type: PidType) {
  notification.info({
    title: 'In progress',
    description: `Editing ${recordLabel(type).toLowerCase()} ${controlNumber}`,
  });
}

export function notifyEditionSuccess(controlNumber: string, type: PidType) {
  notification.success({
    title: 'Success',
    description: `${recordLabel(type)} ${controlNumber} edited successfully`,
  });
}

export function notifyEditionError(error: string, type: PidType) {
  notification.error({
    title: `Unable to edit ${recordLabel(type).toLowerCase()}`,
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

export function notifyReferencesExtractionSuccess(count: number) {
  notification.success({
    title: 'Success',
    description: `${count} references extracted.`,
  });
}

export function notifyReferencesExtractionError() {
  notification.error({
    title: 'Error',
    description: 'Could not extract references',
  });
}

export function notifyReferencesLinkingSuccess() {
  notification.success({
    title: 'Success',
    description: 'References are linked.',
  });
}

export function notifyReferencesLinkingError() {
  notification.error({
    title: 'Error',
    description: 'Could not link references',
  });
}

export function notifyAuthorsExtractionSuccess(count: number) {
  notification.success({
    title: 'Success',
    description: `${count} authors extracted.`,
  });
}

export function notifyAuthorsExtractionWarning(warning: string) {
  notification.warning({
    title: 'Warning',
    description: warning,
    duration: false,
  });
}

export function notifyAuthorsExtractionError(message?: string) {
  notification.error({
    title: 'Error',
    description: message || 'Could not extract authors',
    duration: message ? false : undefined,
  });
}
