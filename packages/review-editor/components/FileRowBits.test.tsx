import { describe, expect, it } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewedControl } from './FileRowBits';

describe('ViewedControl', () => {
  it('renders changed files as yellow and mixed', () => {
    const markup = renderToStaticMarkup(<ViewedControl isViewed={false} needsReview />);

    expect(markup).toContain('aria-checked="mixed"');
    expect(markup).toContain('aria-label="Needs review"');
    expect(markup).toContain('text-warning');
  });
});
