import { useEffect, useRef } from 'react';

export function useGlobalEvent(eventName, callback) {
  const callbackRef = useRef();
  callbackRef.current = callback;
  useEffect(
    () => {
      const eventCallback = event => callbackRef.current(event);
      window.addEventListener(eventName, eventCallback);

      return () => {
        window.removeEventListener(eventName, eventCallback);
      };
    },
    [eventName]
  );
}
