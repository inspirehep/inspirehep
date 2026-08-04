import { StarterKit } from '@tiptap/starter-kit';

export const editorExtensions = [
  StarterKit.configure({
    link: {
      openOnClick: false,
      defaultProtocol: 'https',
      autolink: false,
      HTMLAttributes: {
        rel: 'noopener noreferrer',
        target: '_blank',
      },
    },
    blockquote: false,
    code: false,
    codeBlock: false,
    heading: false,
    horizontalRule: false,
    strike: false,
    underline: false,
  }),
];
