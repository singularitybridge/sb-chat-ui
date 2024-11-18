import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { emitter } from '../services/mittEmitter';

const EVENT_ADD_IFRAME_MESSAGE = 'EVENT_ADD_IFRAME_MESSAGE';

const GenerativeUIFrame: React.FC = () => {
  const location = useLocation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [messageQueue, setMessageQueue] = useState<unknown[]>([]);

  // Log iframe ref state changes
  useEffect(() => {
    console.log('iframeRef.current on mount:', iframeRef.current);
    return () => {
      console.log('iframeRef.current on unmount:', iframeRef.current);
    };
  }, []);

  // Log iframe ready state changes
  useEffect(() => {
    console.log('isIframeReady changed:', isIframeReady);
  }, [isIframeReady]);

  const sendMessageToIframe = useCallback(
    (message: unknown) => {
      console.log('Attempting to send message to iframe:', {
        isIframeReady,
        hasIframeRef: iframeRef.current !== null,
        hasContentWindow: iframeRef.current?.contentWindow !== null,
        queueLength: messageQueue.length,
        message,
      });

      if (!iframeRef.current || !iframeRef.current.contentWindow || !isIframeReady) {
        console.warn('Iframe not ready yet, queuing message');
        setMessageQueue(prevQueue => [...prevQueue, message]);
        return;
      }

      const targetOrigin = process.env.NODE_ENV === 'development'
        ? 'http://localhost:5175'
        : 'https://generative-ui.singularitybridge.com';

      try {
        iframeRef.current.contentWindow.postMessage(message, targetOrigin);
        console.log('Successfully sent message to iframe:', {
          message,
          targetOrigin,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to send message to iframe:', {
          error,
          message,
          targetOrigin
        });
        // Queue the message for retry if sending fails
        setMessageQueue(prevQueue => [...prevQueue, message]);
      }
    },
    [isIframeReady, messageQueue.length]
  );

  // Process queued messages when iframe becomes ready
  useEffect(() => {
    if (isIframeReady && messageQueue.length > 0) {
      console.log('Processing queued messages:', messageQueue.length);
      
      // Process messages in order
      messageQueue.forEach(message => {
        sendMessageToIframe(message);
      });
      
      // Clear the queue after processing
      setMessageQueue([]);
    }
  }, [isIframeReady, messageQueue, sendMessageToIframe]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Current pathname on message receive:', location.pathname);
      
      const allowedOrigins = [
        'https://generative-ui.singularitybridge.com',
        'http://localhost:5175',
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn('Received message from unauthorized origin:', event.origin);
        return;
      }

      const message = event.data;

      if (!message) {
        console.warn('Received empty message');
        return;
      }

      console.log('Received message from iframe:', {
        message,
        origin: event.origin,
        timestamp: new Date().toISOString()
      });

      const stringifiedMessage = JSON.stringify(message, null, 2);
      emitter.emit(EVENT_ADD_IFRAME_MESSAGE, stringifiedMessage);

      // Queue the response if iframe isn't ready yet
      const testResponse = {
        type: 'TEST_RESPONSE',
        data: {
          message: 'This is a test response',
          receivedMessage: message,
          timestamp: new Date().toISOString(),
        },
      };
      sendMessageToIframe(testResponse);
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      setIsIframeReady(false);
    };
  }, [location.pathname, sendMessageToIframe]);

  const handleIframeLoad = useCallback(() => {
    console.log('handleIframeLoad called');
    
    if (!iframeRef.current) {
      console.error('Iframe reference not available after load event');
      return;
    }

    if (!iframeRef.current.contentWindow) {
      console.error('Iframe contentWindow not available after load event');
      return;
    }

    // Ensure the iframe document is fully loaded
    if (iframeRef.current.contentDocument?.readyState === 'complete') {
      console.log('Iframe document fully loaded, marking as ready');
      setIsIframeReady(true);
    } else {
      console.log('Waiting for iframe document to fully load...');
      const checkReadyState = () => {
        if (iframeRef.current?.contentDocument?.readyState === 'complete') {
          console.log('Iframe document now fully loaded, marking as ready');
          setIsIframeReady(true);
        } else {
          setTimeout(checkReadyState, 100);
        }
      };
      setTimeout(checkReadyState, 100);
    }
  }, []);

  // Extract the page ID from the current URL
  const pageId = location.pathname.split('/').pop();
  const shouldRenderIframe = location.pathname.includes('/page/');

  if (!shouldRenderIframe) {
    console.log('Not rendering iframe - current pathname:', location.pathname);
    return null;
  }

  const iframeSrc = process.env.NODE_ENV === 'development'
    ? `http://localhost:5175/page/${pageId}`
    : `https://generative-ui.singularitybridge.com/page/${pageId}`;

  return (
    <iframe
      ref={iframeRef}
      id="generative-ui-iframe"
      src={iframeSrc}
      title="Preview"
      className="w-full h-full border rounded-lg"
      style={{ border: '1px solid rgb(229, 231, 235)' }}
      onLoad={handleIframeLoad}
    />
  );
};

export default GenerativeUIFrame;
