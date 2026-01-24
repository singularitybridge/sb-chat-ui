import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { ExternalLink } from 'lucide-react';
import { WorkspaceSearch } from './WorkspaceSearch';
import { MDXCallout, InfoCallout, WarningCallout, DangerCallout, SuccessCallout, TipCallout, NoteCallout } from './MDXCallout';
import { MDXIcon } from './MDXIcon';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

// Generic MDX components for building apps/pages
import { AppHeader } from './mdx-components/AppHeader';
import { EmptyState } from './mdx-components/EmptyState';
import { ActionGrid } from './mdx-components/ActionGrid';
import { DataGrid } from './mdx-components/DataGrid';
import { StatsGrid } from './mdx-components/StatsGrid';
import { ActionBar } from './mdx-components/ActionBar';
import { TestList } from './mdx-components/TestList';

// Import reactive components
import { UserInput } from './UserInput';
import { AgentExecute } from './AgentExecute';
import { AgentExecuteButton } from './AgentExecuteButton';
import { TextDisplay } from './TextDisplay';
import { JsonDisplay } from './JsonDisplay';
import { StreamingText } from './StreamingText';
import { MarkdownDisplay } from './MarkdownDisplay';
import { DataProcessor } from './DataProcessor';
import { JsonParser } from './JsonParser';
import { DataFilter } from './DataFilter';
import { DataList } from './DataList';
import { DataTable } from './DataTable';
import { ProductList } from './ProductList';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  disableWorkspaceSearch?: boolean; // Disable workspace search in embed contexts
}

/**
 * Strip YAML frontmatter from markdown content
 */
const stripFrontmatter = (content: string): string => {
  // Check if content starts with frontmatter (---)
  if (content.trimStart().startsWith('---')) {
    const lines = content.split('\n');
    let endIndex = -1;

    // Find the closing --- (skip first line)
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        endIndex = i;
        break;
      }
    }

    // If we found closing ---, return content after it
    if (endIndex !== -1) {
      return lines.slice(endIndex + 1).join('\n').trim();
    }
  }

  return content;
};

/**
 * Markdown renderer for workspace MDX/MD files
 * Supports GFM, math equations, raw HTML, and strips YAML frontmatter
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '', disableWorkspaceSearch = false }) => {
  // Strip frontmatter before rendering
  let cleanContent = stripFrontmatter(content);

  // Check if content includes WorkspaceSearch component tag
  const hasWorkspaceSearch = cleanContent.includes('<WorkspaceSearch');

  // Remove WorkspaceSearch tags from content to avoid rendering as text/HTML
  if (hasWorkspaceSearch) {
    cleanContent = cleanContent.replace(/<WorkspaceSearch\s*\/?>|<\/WorkspaceSearch>/g, '').trim();
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .workspace-markdown-content pre {
          background-color: #0f172a !important;
          border: 1px solid rgba(15, 23, 42, 0.5) !important;
          border-radius: 0.5rem !important;
          padding: 0.75rem !important;
          overflow-x: auto !important;
          margin: 1rem 0 !important;
        }
        .workspace-markdown-content pre code {
          color: #f1f5f9 !important;
          background-color: transparent !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 13px !important;
          line-height: 1.75 !important;
          padding: 0 !important;
          border: none !important;
        }
        .workspace-markdown-content :not(pre) > code {
          background-color: var(--color-slate-100, rgb(241 245 249)) !important;
          color: var(--color-pink-600, rgb(219 39 119)) !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.25rem !important;
          font-size: 13px !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 500 !important;
          border: 1px solid var(--color-slate-200, rgb(226 232 240)) !important;
        }
        .dark .workspace-markdown-content :not(pre) > code {
          background-color: rgb(30 41 59) !important;
          color: rgb(244 114 182) !important;
          border: 1px solid rgb(51 65 85) !important;
        }
        .workspace-markdown-content :not(pre) > code::before,
        .workspace-markdown-content :not(pre) > code::after {
          content: '' !important;
        }
      `}} />
      <div className={`workspace-markdown-content prose prose-slate dark:prose-invert max-w-none font-['Inter',sans-serif] px-1 ${className}`} style={{
        fontSize: '16px',
        lineHeight: '1.75'
      }}>
        {/* Render WorkspaceSearch if requested in content and not disabled */}
        {hasWorkspaceSearch && !disableWorkspaceSearch && (
          <div className="not-prose mb-8">
            <WorkspaceSearch />
          </div>
        )}
        <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          // Custom components for better styling with Inter font
          h1: ({ children }: any) => (
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100 mb-5 mt-10 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }: any) => (
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-4 mt-8 border-b border-slate-200 dark:border-slate-700 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }: any) => (
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-3 mt-6">
              {children}
            </h3>
          ),
          h4: ({ children }: any) => (
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2 mt-5">
              {children}
            </h4>
          ),
          p: ({ children, node }: any) => {
            // Check if paragraph contains code blocks or custom components - if so, render as div to avoid nesting issues
            const hasCodeBlock = node?.children?.some((child: any) => child.tagName === 'pre' || child.tagName === 'code');

            // Custom workspace components that render block-level elements (div/form)
            const blockComponentTags = [
              'userinput', 'textdisplay', 'jsondisplay', 'streamingtext', 'markdowndisplay',
              'agentexecute', 'agentexecutebutton', 'dataprocessor', 'jsonparser', 'datafilter',
              'datalist', 'datatable', 'productlist', 'loadingspinner', 'errordisplay',
              'UserInput', 'TextDisplay', 'JsonDisplay', 'StreamingText', 'MarkdownDisplay',
              'AgentExecute', 'AgentExecuteButton', 'DataProcessor', 'JsonParser', 'DataFilter',
              'DataList', 'DataTable', 'ProductList', 'LoadingSpinner', 'ErrorDisplay',
              // Generic MDX app components
              'appheader', 'emptystate', 'actiongrid', 'datagrid', 'statsgrid', 'actionbar', 'testlist',
              'AppHeader', 'EmptyState', 'ActionGrid', 'DataGrid', 'StatsGrid', 'ActionBar', 'TestList'
            ];
            const hasBlockComponent = node?.children?.some((child: any) =>
              blockComponentTags.includes(child.tagName)
            );

            if (hasCodeBlock || hasBlockComponent) {
              return <div className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{children}</div>;
            }

            return <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-6">{children}</p>;
          },
          a: ({ href, children, ...props }: any) => {
            // Check if this is a workspace file link (starts with /)
            const isWorkspaceLink = href?.startsWith('/') && !href.startsWith('//');

            if (isWorkspaceLink) {
              // Workspace file link - load file instead of navigating
              return (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    // @ts-expect-error global function on window
                    if (window.loadWorkspaceFile) {
                      // @ts-expect-error global function on window
                      window.loadWorkspaceFile(href);
                    }
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 decoration-2 cursor-pointer font-medium transition-colors"
                  {...props}
                >
                  {children}
                </a>
              );
            }

            // External link
            return (
              <a
                href={href}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline underline-offset-4 decoration-2 font-medium transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
                <ExternalLink className="h-3.5 w-3.5" aria-label="Opens in new tab" />
              </a>
            );
          },
          ul: ({ children }: any) => (
            <ul className="list-disc list-outside space-y-2 mb-6 text-slate-700 dark:text-slate-300 pl-6 marker:text-slate-400">{children}</ul>
          ),
          ol: ({ children }: any) => (
            <ol className="list-decimal list-outside space-y-2 mb-6 text-slate-700 dark:text-slate-300 pl-6 marker:text-slate-500 marker:font-medium">{children}</ol>
          ),
          li: ({ children }: any) => (
            <li className="pl-2">{children}</li>
          ),
          blockquote: ({ children }: any) => (
            <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-1 my-6 bg-blue-50/50 dark:bg-blue-950/20 rounded-r-lg">
              <div className="text-slate-700 dark:text-slate-300 italic font-medium">
                {children}
              </div>
            </blockquote>
          ),
          code: ({ inline, className, children, node, ...props }: any) => {
            // Check if code is inside a pre tag (block code) or standalone (inline code)
            const isInline = inline !== undefined ? inline : node?.parent?.tagName !== 'pre';
            const match = /language-(\w+)/.exec(className || '');
            return isInline ? (
              <code
                className="bg-slate-100 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-[13px] font-['JetBrains_Mono',monospace] font-medium border border-slate-200 dark:border-slate-700"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={`language-${match?.[1] || ''} font-['JetBrains_Mono',monospace] text-[13px] leading-relaxed`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }: any) => (
            <div className="not-prose relative my-4 group">
              <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto border border-slate-800/50" {...props}>
                {children}
              </pre>
            </div>
          ),
          table: ({ children }: any) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }: any) => (
            <thead className="bg-slate-50 dark:bg-slate-800">{children}</thead>
          ),
          tbody: ({ children }: any) => (
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">{children}</tbody>
          ),
          tr: ({ children }: any) => <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">{children}</tr>,
          th: ({ children }: any) => (
            <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }: any) => (
            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{children}</td>
          ),
          hr: () => <hr className="my-10 border-slate-200 dark:border-slate-700" />,
          img: ({ src, alt }: any) => (
            <img
              src={src}
              alt={alt || ''}
              className="max-w-full h-auto rounded-lg shadow-lg my-8 border border-slate-200 dark:border-slate-700"
            />
          ),
          // Custom button handler for workspace actions
          button: ({ children, ...props }: any) => {
            const dataMessage = props['data-message'];

            // Extract and convert string event handlers to functions
            // Remove both camelCase and lowercase versions to prevent string handlers
            const {
              onclick, onmouseover, onmouseout,
              onClick, onMouseOver, onMouseOut,
              style, className,
              ...restProps
            } = props;

            // Convert string onclick to function (check both camelCase and lowercase)
            const onclickStr = onclick || onClick;
            const handleClick = (typeof onclickStr === 'string')
              ? (_e: React.MouseEvent<HTMLButtonElement>) => {
                  try {
                    // Execute the onclick string as JavaScript
                     
                    eval(onclickStr);
                  } catch (error) {
                    console.error('Error executing onclick:', error);
                  }
                }
              : dataMessage
                ? () => {
                    // @ts-expect-error global function on window
                    if (window.sendWorkspaceMessage) {
                      // @ts-expect-error global function on window
                      window.sendWorkspaceMessage(dataMessage);
                    }
                  }
                : typeof onclickStr === 'function'
                  ? onclickStr
                  : undefined;

            // Convert string onmouseover to function (check both camelCase and lowercase)
            const onmouseoverStr = onmouseover || onMouseOver;
            const handleMouseOver = (typeof onmouseoverStr === 'string')
              ? (e: React.MouseEvent<HTMLButtonElement>) => {
                  try {

                    const fn = new Function('event', onmouseoverStr);
                    fn.call(e.currentTarget, e);
                  } catch (error) {
                    console.error('Error executing onmouseover:', error);
                  }
                }
              : typeof onmouseoverStr === 'function'
                ? onmouseoverStr
                : undefined;

            // Convert string onmouseout to function (check both camelCase and lowercase)
            const onmouseoutStr = onmouseout || onMouseOut;
            const handleMouseOut = (typeof onmouseoutStr === 'string')
              ? (e: React.MouseEvent<HTMLButtonElement>) => {
                  try {

                    const fn = new Function('event', onmouseoutStr);
                    fn.call(e.currentTarget, e);
                  } catch (error) {
                    console.error('Error executing onmouseout:', error);
                  }
                }
              : typeof onmouseoutStr === 'function'
                ? onmouseoutStr
                : undefined;

            // Use shadcn Button component with clean styling
            return (
              <Button
                onClick={handleClick}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                variant={dataMessage || onclickStr ? 'default' : 'secondary'}
                size="sm"
                className={className}
                style={style}
                {...restProps}
              >
                {children}
              </Button>
            );
          },
          // Reactive input components (PascalCase and lowercase for rehypeRaw compatibility)
          // rehypeRaw converts attributes to lowercase, so we need to map them back to camelCase
          UserInput: (props: any) => {
            // rehypeRaw converts camelCase to kebab-case, not lowercase
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const agentName = props['agent-name'] || props.agentName || props.agentname;
            const { 'data-key': _, 'agent-name': __, datakey: _datakey, agentname: _agentname, ...rest } = props;
            return <UserInput {...rest} dataKey={dataKey} agentName={agentName} />;
          },
          userinput: (props: any) => {
            // rehypeRaw converts camelCase to kebab-case, not lowercase
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const agentName = props['agent-name'] || props.agentName || props.agentname;
            const { 'data-key': _, 'agent-name': __, datakey: _datakey, agentname: _agentname, ...rest } = props;
            return <UserInput {...rest} dataKey={dataKey} agentName={agentName} />;
          },
          AgentExecute: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const agentName = props['agent-name'] || props.agentName || props.agentname;
            const { 'data-key': _, 'agent-name': __, datakey: _datakey, agentname: _agentname, ...rest } = props;
            return <AgentExecute {...rest} dataKey={dataKey} agentName={agentName} />;
          },
          agentexecute: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const agentName = props['agent-name'] || props.agentName || props.agentname;
            const { 'data-key': _, 'agent-name': __, datakey: _datakey, agentname: _agentname, ...rest } = props;
            return <AgentExecute {...rest} dataKey={dataKey} agentName={agentName} />;
          },
          AgentExecuteButton: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const agentName = props['agent-name'] || props.agentName || props.agentname;
            const buttonText = props['button-text'] || props.buttonText || props.buttontext;
            const { 'data-key': _, 'agent-name': __, 'button-text': ___, datakey: _datakey, agentname: _agentname, buttontext: _buttontext, ...rest } = props;
            return <AgentExecuteButton {...rest} dataKey={dataKey} agentName={agentName} buttonText={buttonText} />;
          },
          agentexecutebutton: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const agentName = props['agent-name'] || props.agentName || props.agentname;
            const buttonText = props['button-text'] || props.buttonText || props.buttontext;
            const { 'data-key': _, 'agent-name': __, 'button-text': ___, datakey: _datakey, agentname: _agentname, buttontext: _buttontext, ...rest } = props;
            return <AgentExecuteButton {...rest} dataKey={dataKey} agentName={agentName} buttonText={buttonText} />;
          },
          // Reactive display components
          TextDisplay: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <TextDisplay {...rest} dataKey={dataKey} />;
          },
          textdisplay: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <TextDisplay {...rest} dataKey={dataKey} />;
          },
          JsonDisplay: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <JsonDisplay {...rest} dataKey={dataKey} />;
          },
          jsondisplay: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <JsonDisplay {...rest} dataKey={dataKey} />;
          },
          StreamingText: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <StreamingText {...rest} dataKey={dataKey} />;
          },
          streamingtext: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <StreamingText {...rest} dataKey={dataKey} />;
          },
          MarkdownDisplay: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const showLoading = props['show-loading'] || props.showLoading || props.showloading;
            const { 'data-key': _, 'show-loading': __, datakey: _datakey, showloading: _showloading, ...rest } = props;
            return <MarkdownDisplay {...rest} dataKey={dataKey} showLoading={showLoading} />;
          },
          markdowndisplay: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const showLoading = props['show-loading'] || props.showLoading || props.showloading;
            const { 'data-key': _, 'show-loading': __, datakey: _datakey, showloading: _showloading, ...rest } = props;
            return <MarkdownDisplay {...rest} dataKey={dataKey} showLoading={showLoading} />;
          },
          // Reactive processing components
          DataProcessor: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const sourceKey = props['source-key'] || props.sourceKey || props.sourcekey;
            const { 'data-key': _, 'source-key': __, datakey: _datakey, sourcekey: _sourcekey, ...rest } = props;
            return <DataProcessor {...rest} dataKey={dataKey} sourceKey={sourceKey} />;
          },
          dataprocessor: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const sourceKey = props['source-key'] || props.sourceKey || props.sourcekey;
            const { 'data-key': _, 'source-key': __, datakey: _datakey, sourcekey: _sourcekey, ...rest } = props;
            return <DataProcessor {...rest} dataKey={dataKey} sourceKey={sourceKey} />;
          },
          JsonParser: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const sourceKey = props['source-key'] || props.sourceKey || props.sourcekey;
            const { 'data-key': _, 'source-key': __, datakey: _datakey, sourcekey: _sourcekey, ...rest } = props;
            return <JsonParser {...rest} dataKey={dataKey} sourceKey={sourceKey} />;
          },
          jsonparser: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const sourceKey = props['source-key'] || props.sourceKey || props.sourcekey;
            const { 'data-key': _, 'source-key': __, datakey: _datakey, sourcekey: _sourcekey, ...rest } = props;
            return <JsonParser {...rest} dataKey={dataKey} sourceKey={sourceKey} />;
          },
          DataFilter: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const sourceKey = props['source-key'] || props.sourceKey || props.sourcekey;
            const { 'data-key': _, 'source-key': __, datakey: _datakey, sourcekey: _sourcekey, ...rest } = props;
            return <DataFilter {...rest} dataKey={dataKey} sourceKey={sourceKey} />;
          },
          datafilter: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const sourceKey = props['source-key'] || props.sourceKey || props.sourcekey;
            const { 'data-key': _, 'source-key': __, datakey: _datakey, sourcekey: _sourcekey, ...rest } = props;
            return <DataFilter {...rest} dataKey={dataKey} sourceKey={sourceKey} />;
          },
          // Reactive list/table components
          DataList: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <DataList {...rest} dataKey={dataKey} />;
          },
          datalist: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <DataList {...rest} dataKey={dataKey} />;
          },
          DataTable: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <DataTable {...rest} dataKey={dataKey} />;
          },
          datatable: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <DataTable {...rest} dataKey={dataKey} />;
          },
          ProductList: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <ProductList {...rest} dataKey={dataKey} />;
          },
          productlist: (props: any) => {
            const dataKey = props['data-key'] || props.dataKey || props.datakey;
            const { 'data-key': _, datakey: _datakey, ...rest } = props;
            return <ProductList {...rest} dataKey={dataKey} />;
          },
          // Utility components
          LoadingSpinner: (props: any) => <LoadingSpinner {...props} />,
          loadingspinner: (props: any) => <LoadingSpinner {...props} />,
          ErrorDisplay: (props: any) => <ErrorDisplay {...props} />,
          errordisplay: (props: any) => <ErrorDisplay {...props} />,
          // Code block component
          CodeBlock: (props: any) => <CodeBlock {...props} />,
          codeblock: (props: any) => <CodeBlock {...props} />,
          // Callout components (MDX-specific alert/info boxes)
          MDXCallout: (props: any) => <MDXCallout {...props} />,
          mdxcallout: (props: any) => <MDXCallout {...props} />,
          InfoCallout: (props: any) => <InfoCallout {...props} />,
          infocallout: (props: any) => <InfoCallout {...props} />,
          WarningCallout: (props: any) => <WarningCallout {...props} />,
          warningcallout: (props: any) => <WarningCallout {...props} />,
          DangerCallout: (props: any) => <DangerCallout {...props} />,
          dangercallout: (props: any) => <DangerCallout {...props} />,
          SuccessCallout: (props: any) => <SuccessCallout {...props} />,
          successcallout: (props: any) => <SuccessCallout {...props} />,
          TipCallout: (props: any) => <TipCallout {...props} />,
          tipcallout: (props: any) => <TipCallout {...props} />,
          NoteCallout: (props: any) => <NoteCallout {...props} />,
          notecallout: (props: any) => <NoteCallout {...props} />,
          // shadcn/ui components
          Badge: (props: any) => <Badge {...props} />,
          badge: (props: any) => <Badge {...props} />,
          Card: (props: any) => <Card {...props} />,
          card: (props: any) => <Card {...props} />,
          CardHeader: (props: any) => <CardHeader {...props} />,
          cardheader: (props: any) => <CardHeader {...props} />,
          CardTitle: (props: any) => <CardTitle {...props} />,
          cardtitle: (props: any) => <CardTitle {...props} />,
          CardContent: (props: any) => <CardContent {...props} />,
          cardcontent: (props: any) => <CardContent {...props} />,
          // Icon component for Lucide icons
          Icon: (props: any) => <MDXIcon {...props} />,
          icon: (props: any) => <MDXIcon {...props} />,
          // Generic MDX app components
          AppHeader: (props: any) => <AppHeader {...props} />,
          appheader: (props: any) => <AppHeader {...props} />,
          EmptyState: (props: any) => <EmptyState {...props} />,
          emptystate: (props: any) => <EmptyState {...props} />,
          ActionGrid: (props: any) => <ActionGrid {...props} />,
          actiongrid: (props: any) => <ActionGrid {...props} />,
          DataGrid: (props: any) => <DataGrid {...props} />,
          datagrid: (props: any) => <DataGrid {...props} />,
          StatsGrid: (props: any) => <StatsGrid {...props} />,
          statsgrid: (props: any) => <StatsGrid {...props} />,
          ActionBar: (props: any) => <ActionBar {...props} />,
          actionbar: (props: any) => <ActionBar {...props} />,
          TestList: (props: any) => <TestList {...props} />,
          testlist: (props: any) => <TestList {...props} />,
        } as any}
      >
        {cleanContent}
      </ReactMarkdown>
      </div>
    </>
  );
};
