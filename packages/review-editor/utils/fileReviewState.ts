import type { DiffFile } from '../types';
import type { CodeAnnotation, ReviewCommentStatus } from '@plannotator/ui/types';

export function fileReviewRevision(file: DiffFile): string {
  const value = [file.status, file.oldPath ?? '', file.patch].join('\0');
  let first = 0xdeadbeef;
  let second = 0x41c6ce57;

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    first = Math.imul(first ^ code, 2654435761);
    second = Math.imul(second ^ code, 1597334677);
  }

  return (first >>> 0).toString(16).padStart(8, '0')
    + (second >>> 0).toString(16).padStart(8, '0');
}

export function fileReviewRevisions(files: DiffFile[]): Record<string, string> {
  return Object.fromEntries(files.map((file) => [file.path, fileReviewRevision(file)]));
}

export function changedReviewFiles(
  previous: Record<string, string>,
  current: Record<string, string>,
): string[] {
  return Object.entries(current)
    .filter(([path, revision]) => previous[path] === undefined || previous[path] !== revision)
    .map(([path]) => path);
}

export function newUnresolvedCommentFiles(
  previous: Record<string, ReviewCommentStatus['state']>,
  annotations: CodeAnnotation[],
): { states: Record<string, ReviewCommentStatus['state']>; filePaths: string[] } {
  const states: Record<string, ReviewCommentStatus['state']> = {};
  const filePaths = new Set<string>();

  for (const annotation of annotations) {
    const state = annotation.reviewStatus?.state;
    if (!state) continue;
    states[annotation.id] = state;
    if (annotation.filePath && state !== 'addressed' && state !== previous[annotation.id]) {
      filePaths.add(annotation.filePath);
    }
  }

  return { states, filePaths: [...filePaths] };
}
