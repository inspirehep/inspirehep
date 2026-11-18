import { createContext, useContext } from 'react';

type DocumentUpload = (file: File) => Promise<string | undefined>;

export const DocumentUploadContext = createContext<DocumentUpload | undefined>(
  undefined
);

export function useDocumentUpload(): DocumentUpload | undefined {
  return useContext(DocumentUploadContext);
}
