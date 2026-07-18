'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  ChevronDown,
} from 'lucide-react';
import {
  addFaq,
  addFaqCategory,
  deleteFaq,
  deleteFaqCategory,
  reorderFaq,
  reorderFaqCategory,
  updateFaq,
  updateFaqCategory,
} from '@/app/admin/actions';

type Faq = {
  id: string;
  question: string;
  answer: string;
  display_order: number;
  is_visible: boolean;
};

type Category = {
  id: string;
  name: string;
  display_order: number;
  is_visible: boolean;
  faqs: Faq[];
};

type CategoryModalState =
  | { mode: 'create' }
  | { mode: 'edit'; category: Category };

type QuestionModalState =
  | { mode: 'create'; category_id: string }
  | { mode: 'edit'; category_id: string; faq: Faq };

export default function FaqManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.id))
  );
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(
    null
  );
  const [questionModal, setQuestionModal] = useState<QuestionModalState | null>(
    null
  );

  const toggleExpanded = (id: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const run = (fn: () => Promise<{ ok: true } | { ok: true; id: string } | { ok: false; error: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const handleCategoryVisibilityToggle = (cat: Category) => {
    run(() =>
      updateFaqCategory(cat.id, { name: cat.name, is_visible: !cat.is_visible })
    );
  };

  const handleQuestionVisibilityToggle = (categoryId: string, faq: Faq) => {
    run(() =>
      updateFaq(faq.id, {
        category_id: categoryId,
        question: faq.question,
        answer: faq.answer,
        is_visible: !faq.is_visible,
      })
    );
  };

  const handleDeleteCategory = (cat: Category) => {
    const message =
      cat.faqs.length > 0
        ? `Delete "${cat.name}"? This will also remove ${cat.faqs.length} question(s).`
        : `Delete "${cat.name}"?`;
    if (!window.confirm(message)) return;
    run(() => deleteFaqCategory(cat.id));
  };

  const handleDeleteQuestion = (faq: Faq) => {
    if (!window.confirm(`Delete "${faq.question.slice(0, 60)}${faq.question.length > 60 ? '…' : ''}"?`)) return;
    run(() => deleteFaq(faq.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCategoryModal({ mode: 'create' })}
          className="inline-flex items-center gap-2 bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
          {error}
        </div>
      )}

      {categories.length === 0 ? (
        <div className="border border-[#2A2A2A] rounded-sm p-10 text-center text-[#9A9A9A] bg-[#0A0A0A]">
          No FAQ categories yet. Add one to get started.
        </div>
      ) : (
        <ul className="space-y-4">
          {categories.map((cat, index) => {
            const isExpanded = expandedCategoryIds.has(cat.id);
            const isFirst = index === 0;
            const isLast = index === categories.length - 1;
            return (
              <li
                key={cat.id}
                className={`border rounded-sm bg-[#0A0A0A] ${
                  cat.is_visible ? 'border-[#2A2A2A]' : 'border-[#2A2A2A] opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 p-4 border-b border-[#2A2A2A]">
                  <button
                    type="button"
                    onClick={() => toggleExpanded(cat.id)}
                    aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
                    className="text-[#9A9A9A] hover:text-[#F5F5F5]"
                  >
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#F5F5F5] truncate">
                      {cat.name}
                    </p>
                    <p className="text-xs text-[#9A9A9A]">
                      {cat.faqs.length} question{cat.faqs.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pending || isFirst}
                      onClick={() => run(() => reorderFaqCategory(cat.id, 'up'))}
                      className="p-1.5 text-[#9A9A9A] hover:text-[#D4A017] disabled:opacity-30 disabled:hover:text-[#9A9A9A]"
                      aria-label="Move category up"
                      title="Move up"
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      disabled={pending || isLast}
                      onClick={() => run(() => reorderFaqCategory(cat.id, 'down'))}
                      className="p-1.5 text-[#9A9A9A] hover:text-[#D4A017] disabled:opacity-30 disabled:hover:text-[#9A9A9A]"
                      aria-label="Move category down"
                      title="Move down"
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategoryVisibilityToggle(cat)}
                      disabled={pending}
                      className="p-1.5 text-[#9A9A9A] hover:text-[#D4A017]"
                      aria-label={cat.is_visible ? 'Hide category' : 'Show category'}
                      title={cat.is_visible ? 'Hide from public' : 'Show to public'}
                    >
                      {cat.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ mode: 'edit', category: cat })}
                      className="p-1.5 text-[#9A9A9A] hover:text-[#D4A017]"
                      aria-label="Edit category"
                      title="Edit"
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      disabled={pending}
                      className="p-1.5 text-[#9A9A9A] hover:text-red-400"
                      aria-label="Delete category"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {cat.faqs.length === 0 ? (
                      <p className="text-xs text-[#6B6B6B] italic">
                        No questions yet. Add one below.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {cat.faqs.map((faq, qIndex) => {
                          const qFirst = qIndex === 0;
                          const qLast = qIndex === cat.faqs.length - 1;
                          return (
                            <li
                              key={faq.id}
                              className={`border rounded-sm p-3 bg-[#111111] ${
                                faq.is_visible
                                  ? 'border-[#2A2A2A]'
                                  : 'border-[#2A2A2A] opacity-60'
                              }`}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-[#F5F5F5]">
                                    {faq.question}
                                  </p>
                                  <p className="text-xs text-[#9A9A9A] mt-1 whitespace-pre-line">
                                    {faq.answer}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={pending || qFirst}
                                    onClick={() =>
                                      run(() => reorderFaq(faq.id, 'up'))
                                    }
                                    className="p-1 text-[#9A9A9A] hover:text-[#D4A017] disabled:opacity-30 disabled:hover:text-[#9A9A9A]"
                                    aria-label="Move question up"
                                    title="Move up"
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={pending || qLast}
                                    onClick={() =>
                                      run(() => reorderFaq(faq.id, 'down'))
                                    }
                                    className="p-1 text-[#9A9A9A] hover:text-[#D4A017] disabled:opacity-30 disabled:hover:text-[#9A9A9A]"
                                    aria-label="Move question down"
                                    title="Move down"
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuestionVisibilityToggle(cat.id, faq)
                                    }
                                    disabled={pending}
                                    className="p-1 text-[#9A9A9A] hover:text-[#D4A017]"
                                    aria-label={
                                      faq.is_visible
                                        ? 'Hide question'
                                        : 'Show question'
                                    }
                                    title={
                                      faq.is_visible
                                        ? 'Hide from public'
                                        : 'Show to public'
                                    }
                                  >
                                    {faq.is_visible ? (
                                      <Eye size={13} />
                                    ) : (
                                      <EyeOff size={13} />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setQuestionModal({
                                        mode: 'edit',
                                        category_id: cat.id,
                                        faq,
                                      })
                                    }
                                    className="p-1 text-[#9A9A9A] hover:text-[#D4A017]"
                                    aria-label="Edit question"
                                    title="Edit"
                                  >
                                    <Edit size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(faq)}
                                    disabled={pending}
                                    className="p-1 text-[#9A9A9A] hover:text-red-400"
                                    aria-label="Delete question"
                                    title="Delete"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setQuestionModal({ mode: 'create', category_id: cat.id })
                      }
                      className="mt-3 inline-flex items-center gap-2 border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-3 py-2 text-xs rounded-sm transition-colors"
                    >
                      <Plus size={14} />
                      Add Question
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {categoryModal && (
        <CategoryModal
          state={categoryModal}
          onClose={() => setCategoryModal(null)}
          onSuccess={() => {
            setCategoryModal(null);
            router.refresh();
          }}
        />
      )}

      {questionModal && (
        <QuestionModal
          state={questionModal}
          onClose={() => setQuestionModal(null)}
          onSuccess={() => {
            setQuestionModal(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// ─── Category Modal ───────────────────────────────────────────────

function CategoryModal({
  state,
  onClose,
  onSuccess,
}: {
  state: CategoryModalState;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = state.mode === 'edit';
  const [name, setName] = useState(isEdit ? state.category.name : '');
  const [isVisible, setIsVisible] = useState(
    isEdit ? state.category.is_visible : true
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = { name, is_visible: isVisible };
    const result = isEdit
      ? await updateFaqCategory(state.category.id, payload)
      : await addFaqCategory(payload);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    onSuccess();
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Category' : 'Add Category'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">
            Category name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Shipping & Delivery"
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
          />
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#D4A017]"
          />
          <span className="text-sm text-[#F5F5F5]">Visible on public site</span>
        </label>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2A2A]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm rounded-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Question Modal ───────────────────────────────────────────────

function QuestionModal({
  state,
  onClose,
  onSuccess,
}: {
  state: QuestionModalState;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = state.mode === 'edit';
  const [question, setQuestion] = useState(isEdit ? state.faq.question : '');
  const [answer, setAnswer] = useState(isEdit ? state.faq.answer : '');
  const [isVisible, setIsVisible] = useState(isEdit ? state.faq.is_visible : true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      category_id: state.category_id,
      question,
      answer,
      is_visible: isVisible,
    };
    const result = isEdit
      ? await updateFaq(state.faq.id, payload)
      : await addFaq(payload);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    onSuccess();
  };

  return (
    <ModalShell
      title={isEdit ? 'Edit Question' : 'Add Question'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-sm text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">
            Question
          </label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={300}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What is..."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#9A9A9A] mb-2">
            Answer
          </label>
          <textarea
            required
            minLength={3}
            maxLength={3000}
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer, with blank lines between paragraphs."
            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] text-[#F5F5F5] text-sm px-4 py-2.5 rounded-sm focus:border-[#D4A017] focus:outline-none"
          />
          <p className="text-xs text-[#6B6B6B] mt-1">
            Plain text. Blank lines separate paragraphs on the public page.
          </p>
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#D4A017]"
          />
          <span className="text-sm text-[#F5F5F5]">Visible on public site</span>
        </label>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#2A2A2A]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="border border-[#2A2A2A] text-[#9A9A9A] hover:border-[#D4A017] hover:text-[#D4A017] px-4 py-2 text-sm rounded-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#D4A017] hover:bg-[#E8B820] text-[#0A0A0A] font-semibold px-4 py-2 text-sm rounded-sm disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Escape closes. Body scroll lock while open.
  useEscapeAndScrollLock(onClose);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#141414] border border-[#2A2A2A] rounded-sm max-w-lg w-full my-auto p-6 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9A9A9A] hover:text-[#D4A017] transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <h2 className="font-serif text-xl text-[#F5F5F5] mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function useEscapeAndScrollLock(onEscape: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [onEscape]);
}
