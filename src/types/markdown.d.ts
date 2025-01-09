declare module 'react-markdown' {
  interface ReactMarkdownProps {
    components?: {
      math?: React.ComponentType<{ value: string }>;
      inlineMath?: React.ComponentType<{ value: string }>;
    } & Partial<import('react-markdown').Components>;
  }
}

export {};
