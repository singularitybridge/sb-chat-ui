// Load KaTeX runtime for dynamic rendering
export const loadKatexResources = () => {
  // Load KaTeX script if not already loaded
  if (!window.katex) {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  return Promise.resolve();
};

export const renderKatexFormula = (formula: string, displayMode = false): string => {
  if (!window.katex) {
    return formula;
  }

  try {
    const tempElement = document.createElement('div');
    window.katex.render(formula, tempElement, {
      throwOnError: false,
      displayMode
    });
    return tempElement.innerHTML;
  } catch (error) {
    console.error('Error rendering KaTeX formula:', error);
    return formula;
  }
};
