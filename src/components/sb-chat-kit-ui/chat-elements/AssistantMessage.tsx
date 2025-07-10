import React, { useState } from 'react'; // Added useState
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ExternalLink, AlertCircle } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Download from 'yet-another-react-lightbox/plugins/download';
import remarkGfm from 'remark-gfm';
import { MessageWrapper } from './MessageWrapper';
import { formatRelativeTime } from '../../../utils/dateUtils';

interface AssistantMessageProps {
  text: string;
  assistantName: string;
  createdAt: number;
  metadata?: {
    message_type?: string;
    hasError?: boolean;
    [key: string]: any;
  };
}

// Regex to find image URLs (png, jpg, jpeg, gif, webp, svg) including optional query strings.
const imageUrlRegex = /(https?:\/\/[^\s]+?\.(?:png|jpe?g|gif|webp|svg))(\?[^\s]*)?/gi;

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, assistantName, createdAt, metadata }) => {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [currentLightboxImage, setCurrentLightboxImage] = useState<{src: string; alt: string} | null>(null);

  const handleImageClick = (src: string, alt: string) => {
    setCurrentLightboxImage({ src, alt });
    setOpenLightbox(true);
  };

  const markdownComponents: Components = {
    a: ({node: _node, ...props}) => (
      <a {...props} target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
        {props.children}
        <ExternalLink size={14} className="ml-1 inline-block" />
      </a>
    ),
    p: (props) => <p className="my-2 text-sm leading-relaxed" {...props} />,
    pre: (props) => <pre className='not-prose text-left my-2 overflow-x-auto whitespace-pre-wrap bg-gray-900 text-lime-300 p-4 rounded-lg [&>*]:bg-transparent [&>*]:text-lime-300 [&>*]:m-0' dir="ltr" {...props} />,
    table: (props) => <div className="overflow-x-auto my-2"><table className="min-w-full bg-white border border-gray-300 shadow-sm rounded-lg overflow-hidden" {...props} /></div>,
    thead: (props) => <thead className="bg-gray-100" {...props} />,
    th: (props) => <th className="px-4 py-2 rtl:text-right ltr:text-left text-sm font-semibold text-gray-700 uppercase tracking-wider" {...props} />,
    td: (props) => <td className="px-4 py-2 rtl:text-right ltr:text-left text-sm text-gray-900 border-t border-gray-200" {...props} />,
    tr: (props) => <tr className="hover:bg-gray-50" {...props} />,
    ul: (props) => <ul className="list-disc rtl:pr-4 ltr:pl-4 my-2" {...props} />,
    ol: (props) => <ol className="list-decimal rtl:pr-4 ltr:pl-4 my-2" {...props} />,
    li: (props) => <li className="mb-1" {...props} />,
    code: ({ node: _node, className, children, ...htmlProps }) => { 
      // Access inline via htmlProps.inline, assuming it's passed in by react-markdown
      const isInline = (htmlProps as any).inline; 
      const match = /language-(\w+)/.exec(className || '');
      
      // Create a new object for spreading onto the inline code tag, excluding 'inline' and 'node'
      const { inline: _removedInline, node: _removedNode, ...restHtmlProps } = htmlProps as any;

      return !isInline && match ? ( 
        <pre className={`text-left my-2 p-4 bg-gray-800 text-white rounded whitespace-pre-wrap ${className}`} dir="ltr">
          <code className={`language-${match[1]} text-sm`}>{children}</code>
        </pre>
      ) : (
        <code className={`${className} text-sm bg-gray-200 text-gray-800 rounded px-1`} {...restHtmlProps}>
          {children}
        </code>
      );
    },
    img: ({node: _node, src, alt, ...htmlProps}) => { // Destructure src and alt
      const imageSrc = src || '';
      const imageAlt = alt || 'assistant image';
      return (
        <img 
          {...htmlProps}
          src={imageSrc}
          alt={imageAlt}
          className="max-w-full h-auto rounded-lg my-2 border border-gray-200 cursor-pointer" 
          onClick={() => handleImageClick(imageSrc, imageAlt)}
        />
      );
    }
  };

  const renderContent = () => {
    const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/;
    // Check if the entire text is a single markdown image.
    // If so, render it directly with ReactMarkdown which will use the custom 'img' component.
    if (markdownImageRegex.test(text) && text.match(markdownImageRegex)?.[0] === text) {
      return (
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {text}
        </ReactMarkdown>
      );
    }

    // Otherwise, process parts for mixed content (text and raw URLs) using matchAll
    const contentElements: JSX.Element[] = [];
    let lastIndex = 0;

    // Ensure the regex is global for matchAll, imageUrlRegex is already defined with /gi
    for (const match of text.matchAll(imageUrlRegex)) {
      const fullMatchedUrl = match[0]; // This is the full URL including query string
      const urlStartIndex = match.index!;

      // Add text before the image URL
      if (urlStartIndex > lastIndex) {
        const textPart = text.substring(lastIndex, urlStartIndex);
        if (textPart.trim() !== '') {
          contentElements.push(
            <ReactMarkdown key={`text-${lastIndex}`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {textPart}
            </ReactMarkdown>
          );
        }
      }

      // Add the image
      contentElements.push(
          <img 
            key={`img-${urlStartIndex}`} 
            src={fullMatchedUrl.trim()} 
            alt='Assistant generated image' 
            className="max-w-xs md:max-w-sm h-auto rounded-lg my-2 border border-gray-200 cursor-pointer"
            onClick={() => handleImageClick(fullMatchedUrl.trim(), 'Assistant generated image')}
          />
        );
      lastIndex = urlStartIndex + fullMatchedUrl.length;
    }

    // Add any remaining text after the last image
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim() !== '') {
        contentElements.push(
          <ReactMarkdown key={`text-${lastIndex}`} remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {remainingText}
          </ReactMarkdown>
        );
      }
    }
    
    // If no images were found and it's not a markdown image, render the whole text as markdown
    if (contentElements.length === 0 && !(markdownImageRegex.test(text) && text.match(markdownImageRegex)?.[0] === text)) {
        return (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {text}
            </ReactMarkdown>
        );
    }

    return contentElements;
  };

  const isError = metadata?.hasError || metadata?.message_type === 'error_stream';
  
  return (
    <>
      <MessageWrapper 
        icon={isError ? <AlertCircle className="w-4 h-4 text-amber-600" /> : <SparklesIcon className="w-5 h-5 text-gray-700" />} 
        bgColor="" 
        borderColor={isError ? "bg-amber-100" : "bg-blue-100"} 
        role={assistantName}
        dateText={formatRelativeTime(createdAt)}
      >
        <div className={`prose prose-sm max-w-none text-sm break-words rtl:text-right ltr:text-left overflow-hidden prose-pre:p-0 ${isError ? 'text-amber-700' : ''}`}>
          {renderContent()}
        </div>
      </MessageWrapper>
      
      {currentLightboxImage && (
        <Lightbox
          open={openLightbox}
          close={() => {
            setOpenLightbox(false);
            setCurrentLightboxImage(null);
          }}
          slides={currentLightboxImage ? [currentLightboxImage] : []} // Ensure slides is never [null]
          plugins={[Download]}
          download={{
            download: ({ slide, saveAs }) => { // Added saveAs
              // Use the saveAs utility provided by the lightbox plugin
              const fileName = slide.alt || `ai_image_${new Date().getTime()}.png`;
              saveAs(slide.src, fileName);
            }
          }}
        />
      )}
    </>
  );
};

export { AssistantMessage };
// Wrapped component in React.Fragment <> to return multiple top-level elements (MessageWrapper and Lightbox)
