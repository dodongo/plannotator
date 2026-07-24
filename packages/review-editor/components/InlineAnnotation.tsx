import React from 'react';
import { SEVERITY_STYLES, DiffAnnotationMetadata } from '@plannotator/ui/types';
import { SuggestionBlock } from './SuggestionBlock';
import { CommentMeta } from './CommentMeta';
import { CommentActions } from './CommentActions';
import { renderInlineMarkdown } from '../utils/renderInlineMarkdown';

interface InlineAnnotationProps {
  metadata: DiffAnnotationMetadata;
  language?: string;
  isSelected?: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/** Renders a single annotation comment inside the diff view */
export const InlineAnnotation: React.FC<InlineAnnotationProps> = ({
  metadata,
  language,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const severity = metadata.severity ? SEVERITY_STYLES[metadata.severity] : null;
  const reviewStatus = metadata.reviewStatus;
  const reviewStatusLabel = reviewStatus?.state === 'addressed'
    ? 'Addressed by agent'
    : reviewStatus?.state === 'failed'
      ? 'Delivery failed — send again'
      : reviewStatus?.state === 'sending'
        ? 'Sending to Pi'
        : reviewStatus?.state === 'submitted'
          ? 'Waiting for agent'
          : null;

  return (
    <div
      className={`review-comment group${isSelected ? ' is-selected' : ''}`}
      data-annotation-id={metadata.annotationId}
      onClick={() => onSelect(metadata.annotationId)}
    >
      <CommentMeta
        leading={
          severity && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${severity.dot}`} title={severity.label} />
          )
        }
        conventionalLabel={metadata.conventionalLabel}
        decorations={metadata.decorations}
        reviewProfileLabel={metadata.reviewProfileLabel}
        source={metadata.source}
        author={metadata.author}
        createdAt={metadata.createdAt}
      />
      {reviewStatusLabel && (
        <div
          className={reviewStatus?.state === 'addressed'
            ? 'mb-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400'
            : reviewStatus?.state === 'failed'
              ? 'mb-1 text-[10px] font-medium text-red-600 dark:text-red-400'
              : 'mb-1 text-[10px] font-medium text-amber-600 dark:text-amber-400'}
          title={reviewStatus?.note}
        >
          {reviewStatusLabel}
        </div>
      )}
      {metadata.text && (
        <div className="review-comment-body">{renderInlineMarkdown(metadata.text)}</div>
      )}
      {reviewStatus?.state === 'addressed' && reviewStatus.note && (
        <div className="mt-1.5 border-l-2 border-emerald-500/40 pl-2">
          <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Agent response
          </div>
          <div className="text-xs text-foreground/80 review-comment-markdown">
            {renderInlineMarkdown(reviewStatus.note)}
          </div>
        </div>
      )}
      {metadata.reasoning && (
        <div className="review-comment-reasoning text-[11px] text-muted-foreground/60 leading-relaxed mt-1.5">
          {metadata.reasoning}
        </div>
      )}
      {metadata.suggestedCode && (
        <div className="mt-2">
          <SuggestionBlock code={metadata.suggestedCode} originalCode={metadata.originalCode} language={language} />
        </div>
      )}
      <CommentActions
        onEdit={reviewStatus && reviewStatus.state !== 'failed' ? undefined : () => onEdit(metadata.annotationId)}
        copyText={metadata.copyText}
        onDelete={() => onDelete(metadata.annotationId)}
      />
    </div>
  );
};
