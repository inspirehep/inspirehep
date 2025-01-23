import { useEffect, useRef } from 'react';

export function useGlobalEvent(
  eventName: string,
  callback: (event: KeyboardEvent) => void
) {
  const callbackRef = useRef();

  (callbackRef.current as unknown) = callback;

  useEffect(() => {
    // @ts-ignore
    const eventCallback = (event: Event) => callbackRef.current(event);
    window.addEventListener(eventName, eventCallback);

    return () => {
      window.removeEventListener(eventName, eventCallback);
    };
  }, [eventName]);
}
