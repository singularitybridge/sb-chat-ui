import { useEffect, useState, useCallback } from 'react';

interface UseIframeCommunicationParams {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  targetOrigin: string;
  onMessage: (message: any) => void;
}

export const useIframeCommunication = ({
  iframeRef,
  targetOrigin,
  onMessage,
}: UseIframeCommunicationParams) => {
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [messageQueue, setMessageQueue] = useState<any[]>([]);

  const sendMessageToIframe = useCallback(
    (message: any) => {
      if (!iframeRef.current || !iframeRef.current.contentWindow || !isIframeReady) {
        // Queue the message if iframe is not ready
        setMessageQueue((prevQueue) => [...prevQueue, message]);
        return;
      }

      try {
        iframeRef.current.contentWindow.postMessage(message, targetOrigin);
        console.log('Sent message to iframe:', message);
      } catch (error) {
        console.error('Error sending message to iframe:', error);
        // Re-queue the message on error
        setMessageQueue((prevQueue) => [...prevQueue, message]);
      }
    },
    [iframeRef, isIframeReady, targetOrigin]
  );

  // Process queued messages when iframe becomes ready
  useEffect(() => {
    if (isIframeReady && messageQueue.length > 0) {
      messageQueue.forEach((message) => sendMessageToIframe(message));
      setMessageQueue([]);
    }
  }, [isIframeReady, messageQueue, sendMessageToIframe]);

  // Handle messages received from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) {
        console.warn('Received message from unauthorized origin:', event.origin);
        return;
      }

      const message = event.data;
      if (message) {
        onMessage(message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onMessage, targetOrigin]);

  // Handle iframe load event
  const handleIframeLoad = useCallback(() => {
    setIsIframeReady(true);
  }, []);

  return { sendMessageToIframe, handleIframeLoad };
};
