import { useEffect, useRef, RefObject } from 'react';

export default function usePrevious(value: HTMLElement) {
  const ref = useRef<HTMLElement | null>();

  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
