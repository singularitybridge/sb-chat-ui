import mitt from 'mitt';
import { useEffect } from 'react';
export const emitter = mitt();

export const useEventEmitter = <T>(eventName: string, handler: (event: T) => void) => {
  useEffect(() => {
    const typedHandler = (event: unknown) => handler(event as T);
    emitter.on(eventName, typedHandler);
    return () => emitter.off(eventName, typedHandler);
  }, [eventName, handler]);
};

