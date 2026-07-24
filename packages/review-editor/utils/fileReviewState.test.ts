import { describe, expect, it } from 'bun:test';
import type { DiffFile } from '../types';
import { changedReviewFiles, fileReviewRevision, fileReviewRevisions, newUnresolvedCommentFiles } from './fileReviewState';

const file = (patch: string): DiffFile => ({
  path: 'Sources/Example.swift',
  patch,
  additions: 1,
  deletions: 0,
  status: 'modified',
});

describe('file review state', () => {
  it('keeps the same revision for the same diff', () => {
    expect(fileReviewRevision(file('+one'))).toBe(fileReviewRevision(file('+one')));
  });

  it('detects changed and newly added files', () => {
    const previous = fileReviewRevisions([file('+one')]);
    const changed = fileReviewRevisions([file('+two'), { ...file('+new'), path: 'Sources/New.swift' }]);

    expect(changedReviewFiles(previous, changed)).toEqual([
      'Sources/Example.swift',
      'Sources/New.swift',
    ]);
  });

  it('does not treat removed files as needing review', () => {
    const previous = fileReviewRevisions([file('+one'), { ...file('+old'), path: 'Sources/Old.swift' }]);
    const current = fileReviewRevisions([file('+one')]);

    expect(changedReviewFiles(previous, current)).toEqual([]);
  });

  it('flags new non-addressed comments once', () => {
    const annotation = {
      id: 'comment-1',
      type: 'comment' as const,
      filePath: 'Sources/Example.swift',
      lineStart: 1,
      lineEnd: 1,
      side: 'new' as const,
      createdAt: 1,
      reviewStatus: { state: 'submitted' as const },
    };

    const first = newUnresolvedCommentFiles({}, [annotation]);
    expect(first.filePaths).toEqual(['Sources/Example.swift']);
    expect(newUnresolvedCommentFiles(first.states, [annotation]).filePaths).toEqual([]);
    expect(newUnresolvedCommentFiles(first.states, [{
      ...annotation,
      reviewStatus: { state: 'addressed' },
    }]).filePaths).toEqual([]);
  });
});
