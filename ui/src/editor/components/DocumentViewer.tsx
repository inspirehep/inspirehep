import { useState } from 'react';
import { Button, Empty, Tabs } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

import './DocumentViewer.less';

export const MIN_VIEWER_WIDTH = 280;
export const DEFAULT_VIEWER_WIDTH_RATIO = 0.4;
export const MAX_VIEWER_WIDTH_RATIO = 0.8;
const KEYBOARD_STEP = 20;

export const getDefaultViewerWidth = () =>
  Math.max(
    Math.round(window.innerWidth * DEFAULT_VIEWER_WIDTH_RATIO),
    MIN_VIEWER_WIDTH
  );

export type DocumentSource = {
  key: string;
  label: string;
  url: string;
};

type Url = {
  value: string;
  description?: string;
};

const getPdfUrl = (formData: any) => {
  const { urls }: { urls?: Url[] } = formData;
  if (!urls || urls.length === 0) {
    return undefined;
  }
  const pdfUrl = urls
    .map((url) => url.value)
    .find((value) => value.endsWith('.pdf'));
  return pdfUrl ? `${pdfUrl.replace('http://', '//')}#zoom=100` : undefined;
};
const getArxivUrl = (formData: any) => {
  const ePrints = formData.arxiv_eprints;
  if (!ePrints || ePrints.length === 0) {
    return undefined;
  }
  return `//arxiv.org/pdf/${ePrints[0].value}#zoom=100`;
};
const getDoiUrl = (formData: any) => {
  const { dois } = formData;
  if (!dois || dois.length === 0) {
    return undefined;
  }
  return `//doi.org/${dois[0].value}`;
};

type DocumentViewerProps = {
  formData: any;
  width: number;
  onWidthChange: (width: number) => void;
};

const DocumentViewer = ({
  formData,
  width,
  onWidthChange,
}: DocumentViewerProps) => {
  const sources = [
    { key: 'pdf', label: 'pdf', url: getPdfUrl(formData) },
    { key: 'arxiv', label: 'arXiv', url: getArxivUrl(formData) },
    { key: 'doi', label: 'doi', url: getDoiUrl(formData) },
  ].filter((source): source is DocumentSource => !!source.url);

  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const selected =
    sources.find((source) => source.key === selectedKey) ?? sources[0];

  const clamp = (value: number) =>
    Math.min(
      Math.max(value, MIN_VIEWER_WIDTH),
      window.innerWidth * MAX_VIEWER_WIDTH_RATIO
    );

  const onResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const onMove = (moveEvent: PointerEvent) =>
      onWidthChange(clamp(window.innerWidth - moveEvent.clientX));
    const stop = () => {
      document.body.classList.remove('document-viewer-resizing');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
    document.body.classList.add('document-viewer-resizing');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  };

  const onResizeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      onWidthChange(clamp(width + KEYBOARD_STEP));
    } else if (event.key === 'ArrowRight') {
      onWidthChange(clamp(width - KEYBOARD_STEP));
    }
  };

  return (
    <aside
      className="__DocumentViewer__"
      style={{ width }}
      aria-label="Document viewer"
    >
      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="resize-handle"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize document viewer"
        aria-valuenow={width}
        aria-valuemin={MIN_VIEWER_WIDTH}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onKeyDown={onResizeKeyDown}
      />
      <div className="viewer-content">
        {selected ? (
          <Tabs
            className="viewer-tabs"
            size="small"
            activeKey={selected.key}
            onChange={setSelectedKey}
            items={sources.map(({ key, label, url }) => ({
              key,
              label: (
                <span className="viewer-tab-label">
                  {label}
                  <Button
                    size="small"
                    type="link"
                    icon={<ExportOutlined />}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${label} in new tab`}
                    onClick={(event) => event.stopPropagation()}
                  />
                </span>
              ),
              children: (
                <iframe
                  className="viewer-frame"
                  referrerPolicy="no-referrer"
                  title={`Document: ${label}`}
                  src={url}
                />
              ),
            }))}
          />
        ) : (
          <Empty
            className="viewer-empty"
            description="This record has no document, arXiv eprint or DOI to display."
          />
        )}
      </div>
    </aside>
  );
};

export default DocumentViewer;
