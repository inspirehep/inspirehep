import { theme } from 'antd';
import QuillEditor, { Quill } from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.less';
import EditorToolbar from './EditorToolbar';

// change default text default (`P`)
const Block = Quill.import('blots/block');
Block.tagName = 'DIV';
Quill.register(Block, true);

const QUILL_MODULES = {
  toolbar: '#toolbar',
};

const QUILL_FORMATS = ['bold', 'italic', 'list', 'bullet', 'link'];

function useAntInputStyle() {
  const { token } = theme.useToken();
  const {
    colorBorder,
    colorPrimary,
    colorPrimaryHover,
    colorBgContainer,
    colorText,
    controlHeight,
    fontSize,
    lineHeight,
    lineWidth,
    lineType,
    paddingSM,
    borderRadius,
    controlOutline,
    controlOutlineWidth,
    motionDurationMid,
  } = token;

  const paddingBlock = Math.max(
    Math.round(((controlHeight - fontSize * lineHeight) / 2) * 10) / 10 -
      lineWidth,
    0
  );
  const paddingInline = paddingSM - lineWidth;

  return {
    '--rte-bg': colorBgContainer,
    '--rte-color': colorText,
    '--rte-font-size': `${fontSize}px`,
    '--rte-line-height': lineHeight,
    '--rte-padding-block': `${paddingBlock}px`,
    '--rte-padding-inline': `${paddingInline}px`,
    '--rte-border-width': `${lineWidth}px`,
    '--rte-border-style': lineType,
    '--rte-border-color': colorBorder,
    '--rte-border-radius': `${borderRadius}px`,
    '--rte-hover-border-color': colorPrimaryHover,
    '--rte-active-border-color': colorPrimary,
    '--rte-active-shadow': `0 0 0 ${controlOutlineWidth}px ${controlOutline}`,
    '--rte-transition-duration': motionDurationMid,
    width: '100%',
  };
}

function RichTextEditor(props) {
  const {
    'data-test-type': dataTestType,
    'data-test-id': dataTestId,
    ...quillProps
  } = props;
  const style = useAntInputStyle();

  return (
    <div
      className="__RichTextEditor__"
      data-test-type={dataTestType}
      data-test-id={dataTestId}
      style={style}
    >
      <div id="toolbar">
        <EditorToolbar />
      </div>
      <QuillEditor
        theme="snow"
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        {...quillProps}
      />
    </div>
  );
}

RichTextEditor.propTypes = QuillEditor.propTypes;

export default RichTextEditor;
