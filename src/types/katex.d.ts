declare global {
  interface Window {
    katex?: {
      render(
        math: string,
        element: HTMLElement,
        options?: {
          throwOnError?: boolean;
          displayMode?: boolean;
          output?: string;
        }
      ): void;
    };
  }
}

export {};
