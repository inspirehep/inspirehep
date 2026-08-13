import { Button } from 'antd';
import { ReactNode } from 'react';
import { useLinkClickHandler } from 'react-router-dom';

interface RouterLinkButtonProps {
  to: string;
  [x: string]: any;
  type?: 'primary' | 'text' | 'default' | 'dashed' | 'link';
  children: ReactNode;
  block?: boolean;
}

function RouterLinkButton({
  to,
  children,
  type = 'primary',
  block = false,
  ...rest
}: RouterLinkButtonProps) {
  const handleClick = useLinkClickHandler<HTMLElement>(to);

  return (
    <Button {...rest} type={type} block={block} onClick={handleClick}>
      {children}
    </Button>
  );
}

export default RouterLinkButton;
