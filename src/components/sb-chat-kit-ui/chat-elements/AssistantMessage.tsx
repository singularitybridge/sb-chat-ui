import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ExternalLink, AlertCircle, Circle, CheckCircle2, Clock, Eye, Ban, AlertTriangle, ArrowUp, ArrowDown, Minus, Send, Check } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { code } from '@streamdown/code';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Download from 'yet-another-react-lightbox/plugins/download';
import { formatRelativeTime } from '../../../utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { emitter } from '@/services/mittEmitter';

// Helper to check if a table row contains only separator-like content (---)
const isEmptyOrSeparatorRow = (children: React.ReactNode): boolean => {
  const childArray = React.Children.toArray(children);
  return childArray.every((child: any) => {
    const content = child?.props?.children;
    if (!content) return true;
    const text = typeof content === 'string' ? content :
                 Array.isArray(content) ? content.join('') : String(content);
    return !text || /^[-\s]*$/.test(text.trim());
  });
};

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

// Preprocess markdown to fix common AI formatting issues and convert action links
const preprocessMarkdown = (text: string): string => {
  let processed = text;

  // Fix tables output on single line by AI
  // The AI often outputs tables like: | Col1 | Col2 | |---| | Data1 | Data2 |

  // Step 1: Add newline before separator row (|---|---|)
  processed = processed.replace(/\s*(\|[\s]*[-:]+[\s]*(?:\|[\s]*[-:]+[\s]*)+\|)\s*/g, '\n$1\n');

  // Step 2: Split rows - when we see "| |" pattern (end of cell, start of new row)
  // But not for separator rows
  processed = processed.replace(/\|\s+\|(?!\s*[-:])/g, '|\n|');

  // Step 3: Also handle "||" without space
  processed = processed.replace(/\|\|(?!\s*[-:])/g, '|\n|');

  // Step 4: Clean up multiple newlines
  processed = processed.replace(/\n{3,}/g, '\n\n');
  processed = processed.replace(/^\n+/, '');

  // Process lines to ensure proper table structure
  const lines = processed.split('\n');
  const newLines: string[] = [];
  let inTable = false;
  let hasSeenSeparator = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this looks like a table row
    const pipeCount = (line.match(/\|/g) || []).length;
    const isTableLine = pipeCount >= 2 && line.includes('|');
    const isSeparatorRow = isTableLine && /^[\s|:-]+$/.test(line) && line.includes('-');

    if (isTableLine && !isSeparatorRow) {
      const columnCount = pipeCount - 1;

      if (!inTable) {
        // Starting a new table
        inTable = true;
        hasSeenSeparator = false;

        // Ensure line starts and ends with |
        let cleanLine = line;
        if (!cleanLine.startsWith('|')) cleanLine = '|' + cleanLine;
        if (!cleanLine.endsWith('|')) cleanLine = cleanLine + '|';
        newLines.push(cleanLine);

        // Check if next line is a separator, if not add one
        const nextLine = lines[i + 1]?.trim() || '';
        const nextIsSeparator = /^[\s|:-]+$/.test(nextLine) && nextLine.includes('-');
        if (!nextIsSeparator) {
          newLines.push('|' + Array(Math.max(columnCount, 1)).fill('---').join('|') + '|');
          hasSeenSeparator = true;
        }
      } else {
        // Continuing table
        let cleanLine = line;
        if (!cleanLine.startsWith('|')) cleanLine = '|' + cleanLine;
        if (!cleanLine.endsWith('|')) cleanLine = cleanLine + '|';
        newLines.push(cleanLine);
      }
    } else if (isSeparatorRow) {
      if (inTable && !hasSeenSeparator) {
        // Ensure separator line is properly formatted
        let cleanLine = line;
        if (!cleanLine.startsWith('|')) cleanLine = '|' + cleanLine;
        if (!cleanLine.endsWith('|')) cleanLine = cleanLine + '|';
        newLines.push(cleanLine);
        hasSeenSeparator = true;
      }
      // Skip duplicate separators
    } else {
      // Non-table line
      inTable = false;
      hasSeenSeparator = false;
      newLines.push(lines[i]);
    }
  }
  processed = newLines.join('\n');

  // Convert action links to parseable format
  // [text](#action:message) → [text](https://action.local/message)
  processed = processed.replace(
    /\[([^\]]+)\]\(#action:([^)]+)\)/g,
    (_, label, action) => `[${label}](https://action.local/${encodeURIComponent(action)})`
  );

  // Also handle standalone (#action:text) format (AI sometimes outputs this)
  // (#action:message) → [message](https://action.local/message)
  processed = processed.replace(
    /\(#action:([^)]+)\)/g,
    (_, action) => `[${action}](https://action.local/${encodeURIComponent(action)})`
  );

  // Clean up action link formatting
  // Handle patterns like: |Actions: [link] | [link] | [link] ||---|
  // Or standalone: | [link] | [link] ||---|---|
  processed = processed.split('\n').map(line => {
    const trimmed = line.trim();

    // Check if line contains action links and pipe separators (not a real table row)
    const hasActionLinks = trimmed.includes('](#action:') || trimmed.includes('](https://action.local/');
    const startsWithPipe = trimmed.startsWith('|');
    const isTableSeparator = /^\|[\s-:|]+\|$/.test(trimmed);

    // Clean up lines with action links that have pipe formatting
    if (hasActionLinks && startsWithPipe && !isTableSeparator) {
      let cleaned = line.replace(/^\|?\s*Actions:\s*/, '**Actions:** ');
      cleaned = cleaned.replace(/\|+\s*-+\s*-*\s*\|*\s*$/g, ''); // Remove |---|---| patterns at end
      cleaned = cleaned.replace(/^\s*\|\s*/, ''); // Remove leading pipe
      cleaned = cleaned.replace(/\s*\|\s*$/g, ''); // Remove trailing pipe
      cleaned = cleaned.replace(/\s*\|\s*/g, '  '); // Replace remaining pipes with spaces
      return cleaned;
    }

    // Also handle **Actions:** lines followed by pipes
    if (trimmed.startsWith('**Actions:**') || trimmed.startsWith('Actions:')) {
      let cleaned = line.replace(/\|+\s*-+\s*-*\s*\|*\s*$/g, ''); // Remove |---|---| patterns
      cleaned = cleaned.replace(/\s*\|\s*(?=\[)/g, ' '); // Remove | before [links]
      cleaned = cleaned.replace(/\]\s*\|\s*(?!\[)/g, '] '); // Remove | after links if not followed by link
      return cleaned;
    }

    return line;
  }).join('\n');

  return processed;
};

// Status badge configuration using shadcn Badge variants
const statusConfig: Record<string, { icon: React.ComponentType<any>; variant: 'default' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' }> = {
  // Task/ticket statuses
  'to do': { icon: Circle, variant: 'secondary' },
  'backlog': { icon: Circle, variant: 'secondary' },
  'open': { icon: Circle, variant: 'secondary' },
  'in progress': { icon: Clock, variant: 'info' },
  'review': { icon: Eye, variant: 'warning' },
  'in review': { icon: Eye, variant: 'warning' },
  'done': { icon: CheckCircle2, variant: 'success' },
  'complete': { icon: CheckCircle2, variant: 'success' },
  'completed': { icon: CheckCircle2, variant: 'success' },
  'closed': { icon: CheckCircle2, variant: 'success' },
  'blocked': { icon: Ban, variant: 'danger' },
  // Reservation statuses
  'confirmed': { icon: CheckCircle2, variant: 'success' },
  'pending': { icon: Clock, variant: 'info' },
  'cancelled': { icon: Ban, variant: 'danger' },
  'canceled': { icon: Ban, variant: 'danger' },
  'waitlist': { icon: Clock, variant: 'warning' },
};

const priorityConfig: Record<string, { icon: React.ComponentType<any>; variant: 'default' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' }> = {
  'critical': { icon: AlertTriangle, variant: 'danger' },
  'highest': { icon: ArrowUp, variant: 'danger' },
  'high': { icon: ArrowUp, variant: 'warning' },
  'medium': { icon: Minus, variant: 'info' },
  'low': { icon: ArrowDown, variant: 'secondary' },
  'lowest': { icon: ArrowDown, variant: 'secondary' },
};

// Helper to render smart badges for status/priority values
const renderSmartCell = (children: React.ReactNode): React.ReactNode => {
  if (typeof children !== 'string' && !Array.isArray(children)) return children;

  const text = Array.isArray(children) ? children.join('') : String(children);
  const normalizedText = text.toLowerCase().trim();

  // Check for status match
  const statusMatch = statusConfig[normalizedText];
  if (statusMatch) {
    const Icon = statusMatch.icon;
    return (
      <Badge variant={statusMatch.variant} className="gap-1 h-[18px] text-[10px] font-medium px-1.5 font-inter">
        <Icon className="w-2.5 h-2.5" />
        {text}
      </Badge>
    );
  }

  // Check for priority match
  const priorityMatch = priorityConfig[normalizedText];
  if (priorityMatch) {
    const Icon = priorityMatch.icon;
    return (
      <Badge variant={priorityMatch.variant} className="gap-1 h-[18px] text-[10px] font-medium px-1.5 font-inter">
        <Icon className="w-2.5 h-2.5" />
        {text}
      </Badge>
    );
  }

  return children;
};

const AssistantMessage: React.FC<AssistantMessageProps> = ({ text, assistantName, createdAt, metadata }) => {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [currentLightboxImage, setCurrentLightboxImage] = useState<{src: string; alt: string} | null>(null);

  const handleImageClick = (src: string, alt: string) => {
    setCurrentLightboxImage({ src, alt });
    setOpenLightbox(true);
  };

  // Custom components for Streamdown - Inter font, clean minimal styling
  const components = {
    // Headings - clean hierarchy with Inter font
    h1: (props: any) => <h1 className="text-sm font-semibold text-foreground mt-4 mb-2 first:mt-0 font-inter" {...props} />,
    h2: (props: any) => <h2 className="text-[13px] font-semibold text-foreground mt-4 mb-2 first:mt-0 font-inter" {...props} />,
    h3: (props: any) => <h3 className="text-xs font-medium text-muted-foreground mt-3 mb-1.5 first:mt-0 font-inter" {...props} />,
    h4: (props: any) => <h4 className="text-[11px] font-medium text-muted-foreground mt-2 mb-1 uppercase tracking-wide font-inter" {...props} />,

    // Links and action buttons
    a: ({node: _node, href, children, ...props}: any) => {
      // Check for action links: https://action.local/message (preprocessed from #action:)
      if (href?.startsWith('https://action.local/')) {
        const message = decodeURIComponent(href.replace('https://action.local/', ''));
        return (
          <button
            className="inline-flex items-center gap-1 h-5 px-2 text-[10px] text-primary bg-primary/10 hover:bg-primary/15 rounded-full font-medium transition-colors mx-0.5"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              emitter.emit('chat:send-message', message);
            }}
          >
            {children}
            <Send className="w-2.5 h-2.5" />
          </button>
        );
      }
      // Also check original format in case preprocessing didn't run
      if (href?.startsWith('#action:')) {
        const message = decodeURIComponent(href.slice(8));
        return (
          <button
            className="inline-flex items-center gap-1 h-5 px-2 text-[10px] text-primary bg-primary/10 hover:bg-primary/15 rounded-full font-medium transition-colors mx-0.5"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              emitter.emit('chat:send-message', message);
            }}
          >
            {children}
            <Send className="w-2.5 h-2.5" />
          </button>
        );
      }
      // Regular external links
      return (
        <a {...props} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-[13px] text-primary hover:underline font-medium">
          {children}
          <ExternalLink size={10} className="inline-block" />
        </a>
      );
    },

    // Paragraphs
    p: (props: any) => <p className="my-1 text-[13px] leading-snug text-foreground font-inter" {...props} />,

    // Tables - full width, consistent text sizing
    table: (props: any) => (
      <div className="my-2 overflow-x-auto border border-border rounded-lg">
        <table className="w-full border-collapse text-[13px]" {...props} />
      </div>
    ),
    thead: (props: any) => {
      // Hide thead if all th cells are empty
      const children = React.Children.toArray(props.children);
      const hasContent = children.some((child: any) => {
        if (!child?.props?.children) return false;
        const cells = React.Children.toArray(child.props.children);
        return cells.some((cell: any) => {
          const cellContent = cell?.props?.children;
          return cellContent && String(cellContent).trim() !== '';
        });
      });
      if (!hasContent) return null;
      return <thead className="bg-muted/40 border-b border-border" {...props} />;
    },
    th: (props: any) => <th className="px-3 py-1.5 rtl:text-right ltr:text-left text-[10px] font-medium text-muted-foreground uppercase tracking-wide font-inter" {...props} />,
    td: ({ children, ...props }: any) => (
      <td className="px-3 py-1.5 rtl:text-right ltr:text-left text-[13px] text-foreground font-inter" {...props}>
        {renderSmartCell(children)}
      </td>
    ),
    tr: (props: any) => {
      // Hide rows where all cells are empty or just dashes
      if (isEmptyOrSeparatorRow(props.children)) {
        return null;
      }
      return <tr className="border-b border-border last:border-0 hover:bg-muted/10 transition-colors" {...props} />;
    },

    // Lists - clean with custom bullets
    ul: (props: any) => <ul className="my-1.5 space-y-0.5 font-inter" {...props} />,
    ol: (props: any) => <ol className="list-decimal rtl:pr-4 ltr:pl-4 my-1.5 space-y-0.5 font-inter" {...props} />,
    li: ({ children, ...props }: any) => (
      <li className="flex items-start gap-2 text-[13px] leading-snug text-foreground" {...props}>
        <Check className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
        <span>{children}</span>
      </li>
    ),

    // Strong/emphasis
    strong: (props: any) => <strong className="font-semibold text-foreground" {...props} />,
    em: (props: any) => <em className="text-muted-foreground italic" {...props} />,

    // Horizontal rule
    hr: () => <hr className="my-4 border-border/40" />,

    // Images
    img: ({node: _node, src, alt, ...htmlProps}: any) => {
      const imageSrc = src || '';
      const imageAlt = alt || 'assistant image';
      return (
        <img
          {...htmlProps}
          src={imageSrc}
          alt={imageAlt}
          className="max-w-full h-auto rounded-lg my-2 border border-border/40 cursor-pointer hover:opacity-90 transition-opacity shadow-sm"
          onClick={() => handleImageClick(imageSrc, imageAlt)}
        />
      );
    }
  };

  const renderContent = () => {
    // Preprocess to fix table formatting and convert action links
    const processedText = preprocessMarkdown(text);

    const markdownImageRegex = /!\[(.*?)\]\((.*?)\)/;

    // Check if the entire text is a single markdown image
    if (markdownImageRegex.test(processedText) && processedText.match(markdownImageRegex)?.[0] === processedText) {
      return (
        <Streamdown plugins={{ code }} components={components} linkSafety={{ enabled: false }}>
          {processedText}
        </Streamdown>
      );
    }

    // Process parts for mixed content (text and raw image URLs)
    const contentElements: React.ReactElement[] = [];
    let lastIndex = 0;

    for (const match of processedText.matchAll(imageUrlRegex)) {
      const fullMatchedUrl = match[0];
      const urlStartIndex = match.index!;

      if (urlStartIndex > lastIndex) {
        const textPart = processedText.substring(lastIndex, urlStartIndex);
        if (textPart.trim() !== '') {
          contentElements.push(
            <Streamdown key={`text-${lastIndex}`} plugins={{ code }} components={components} linkSafety={{ enabled: false }}>
              {textPart}
            </Streamdown>
          );
        }
      }

      contentElements.push(
        <img
          key={`img-${urlStartIndex}`}
          src={fullMatchedUrl.trim()}
          alt='Assistant generated image'
          className="max-w-xs md:max-w-sm h-auto rounded-lg my-2 border border-border cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => handleImageClick(fullMatchedUrl.trim(), 'Assistant generated image')}
        />
      );
      lastIndex = urlStartIndex + fullMatchedUrl.length;
    }

    if (lastIndex < processedText.length) {
      const remainingText = processedText.substring(lastIndex);
      if (remainingText.trim() !== '') {
        contentElements.push(
          <Streamdown key={`text-${lastIndex}`} plugins={{ code }} components={components} linkSafety={{ enabled: false }}>
            {remainingText}
          </Streamdown>
        );
      }
    }

    // If no images were found, render the whole text
    if (contentElements.length === 0) {
      return (
        <Streamdown plugins={{ code }} components={components} linkSafety={{ enabled: false }}>
          {processedText}
        </Streamdown>
      );
    }

    return contentElements;
  };

  const isError = metadata?.hasError || metadata?.message_type === 'error_stream';

  return (
    <>
      <div className="flex w-full max-w-[95%] flex-col gap-1 my-2">
        {/* Header - left aligned */}
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isError ? 'bg-warning' : 'bg-primary/10'}`}>
            {isError ? (
              <AlertCircle className="w-4 h-4 text-warning-foreground" />
            ) : (
              <SparklesIcon className="w-4 h-4 text-primary" />
            )}
          </div>
          <span className="text-[13px] font-medium text-foreground">{assistantName}</span>
        </div>
        {/* Message content - in a card bubble */}
        <div className="ml-9">
          <div className={`bg-primary/5 rounded-2xl rounded-tl-sm px-4 py-3 ${isError ? 'bg-warning/10' : ''}`}>
            <div className={`max-w-none text-[13px] break-words rtl:text-right ltr:text-left overflow-hidden ${isError ? 'text-warning-foreground' : 'text-foreground'}`}>
              {renderContent()}
            </div>
          </div>
          {/* Timestamp at bottom */}
          <span className="text-[10px] text-muted-foreground mt-1 block">{formatRelativeTime(createdAt)}</span>
        </div>
      </div>

      {currentLightboxImage && (
        <Lightbox
          open={openLightbox}
          close={() => {
            setOpenLightbox(false);
            setCurrentLightboxImage(null);
          }}
          slides={currentLightboxImage ? [currentLightboxImage] : []}
          plugins={[Download]}
          download={{
            download: ({ slide, saveAs }) => {
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
