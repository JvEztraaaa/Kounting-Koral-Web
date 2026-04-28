import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Plus,
  NotebookText,
  ListChecks,
  Image as ImageIcon,
  Pencil,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '../features/notes';
import { Button, ConfirmDialog, Input, Modal, Textarea } from '../components/ui';
import { EmptyState, ErrorState } from '../components/common';
import { cn } from '../lib/utils';

const NOTE_TYPES = {
  text: 'text',
  list: 'list',
  image: 'image',
};

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

const createDefaultDraft = (type = NOTE_TYPES.text) => ({
  noteType: type,
  title: '',
  body: '',
  checklistItems: [],
  imageData: null,
});

function toChecklistItems(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => ({
      id: item?.id || `item-${index}`,
      text: item?.text || '',
      checked: !!item?.checked,
    }))
    .filter((item) => item.text.trim());
}

function NotesPage() {
  const { data: notes = [], isLoading, error, refetch } = useNotes();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [showComposer, setShowComposer] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [newItemText, setNewItemText] = useState('');
  const [fileError, setFileError] = useState('');
  const [draft, setDraft] = useState(createDefaultDraft());

  const isSaving = createNote.isPending || updateNote.isPending;

  const typeOptions = useMemo(
    () => [
      {
        key: NOTE_TYPES.text,
        label: 'Text',
        icon: NotebookText,
        helper: 'Simple title and body note',
      },
      {
        key: NOTE_TYPES.list,
        label: 'List',
        icon: ListChecks,
        helper: 'Checklist with checkboxes',
      },
      {
        key: NOTE_TYPES.image,
        label: 'Image',
        icon: ImageIcon,
        helper: 'Upload an image with title',
      },
    ],
    []
  );

  const resetComposer = () => {
    setDraft(createDefaultDraft());
    setEditingNote(null);
    setNewItemText('');
    setFileError('');
  };

  const openCreateComposer = () => {
    resetComposer();
    setShowComposer(true);
  };

  const openEditComposer = (note) => {
    setDraft({
      noteType: note.note_type,
      title: note.title || '',
      body: note.body || '',
      checklistItems: toChecklistItems(note.checklist_items),
      imageData: note.image_data || null,
    });
    setEditingNote(note);
    setNewItemText('');
    setFileError('');
    setShowComposer(true);
  };

  const closeComposer = () => {
    setShowComposer(false);
    resetComposer();
  };

  const setDraftField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type) => {
    setDraft((prev) => ({
      ...prev,
      noteType: type,
      checklistItems: type === NOTE_TYPES.list ? prev.checklistItems : [],
      imageData: type === NOTE_TYPES.image ? prev.imageData : null,
    }));
    setFileError('');
  };

  const handleAddChecklistItem = () => {
    const value = newItemText.trim();
    if (!value) return;

    setDraft((prev) => ({
      ...prev,
      checklistItems: [
        ...prev.checklistItems,
        {
          id: crypto.randomUUID(),
          text: value,
          checked: false,
        },
      ],
    }));

    setNewItemText('');
  };

  const handleToggleDraftChecklistItem = (id) => {
    setDraft((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleRemoveDraftChecklistItem = (id) => {
    setDraft((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((item) => item.id !== id),
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please upload an image file.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFileError('Image must be 3 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraftField('imageData', reader.result);
      setFileError('');
    };
    reader.readAsDataURL(file);
  };

  const validateDraft = () => {
    if (!draft.title.trim()) return 'Title is required.';

    if (draft.noteType === NOTE_TYPES.text && !draft.body.trim()) {
      return 'Body is required for a text note.';
    }

    if (draft.noteType === NOTE_TYPES.list && draft.checklistItems.length === 0) {
      return 'Add at least one checklist item.';
    }

    if (draft.noteType === NOTE_TYPES.image && !draft.imageData) {
      return 'Please upload an image.';
    }

    return null;
  };

  const handleSaveNote = async (event) => {
    event.preventDefault();

    const validationError = validateDraft();
    if (validationError) {
      setFileError(validationError);
      return;
    }

    const payload = {
      note_type: draft.noteType,
      title: draft.title.trim(),
      body: draft.body.trim() || null,
      checklist_items:
        draft.noteType === NOTE_TYPES.list
          ? draft.checklistItems.map((item) => ({
              id: item.id,
              text: item.text,
              checked: item.checked,
            }))
          : [],
      image_data: draft.noteType === NOTE_TYPES.image ? draft.imageData : null,
    };

    try {
      if (editingNote) {
        await updateNote.mutateAsync({ id: editingNote.id, ...payload });
      } else {
        await createNote.mutateAsync(payload);
      }
      closeComposer();
    } catch (saveError) {
      setFileError(saveError.message || 'Failed to save note.');
    }
  };

  const handleToggleChecklistFromCard = async (note, itemId) => {
    const currentItems = toChecklistItems(note.checklist_items);
    const nextItems = currentItems.map((item) =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    try {
      await updateNote.mutateAsync({
        id: note.id,
        checklist_items: nextItems,
      });
    } catch (toggleError) {
      console.error('Failed to update checklist item:', toggleError);
    }
  };

  const handleDeleteNote = async () => {
    if (!deletingNote) return;

    try {
      await deleteNote.mutateAsync(deletingNote.id);
    } catch (deleteError) {
      console.error('Failed to delete note:', deleteError);
    }
  };

  const openImagePreview = (src, title) => {
    setPreviewImage({ src, title });
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load notes"
        description={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="page-shell px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="page-header-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
              Notes
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
              Capture quick thoughts, checklists, and image notes in one clean board.
            </p>
          </div>
          <Button onClick={openCreateComposer} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="surface-card h-44 animate-pulse bg-slate-100 dark:bg-slate-800"
            />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={NotebookText}
          title="No notes yet"
          description="Tap Add Note to create your first text, list, or image note."
          actionLabel="Create a note"
          onAction={openCreateComposer}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
          {notes.map((note) => {
            const checklistItems = toChecklistItems(note.checklist_items);

            return (
              <article
                key={note.id}
                className={cn(
                  'surface-card p-4 sm:p-5 transition-all hover:shadow-[var(--shadow-raise)]',
                  note.note_type === NOTE_TYPES.image && 'overflow-hidden'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 break-words">
                      {note.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide">
                      {note.note_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditComposer(note)}
                      aria-label="Edit note"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => setDeletingNote(note)}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {note.note_type === NOTE_TYPES.text && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                    {note.body}
                  </p>
                )}

                {note.note_type === NOTE_TYPES.list && (
                  <div className="space-y-2">
                    {checklistItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleChecklistFromCard(note, item.id)}
                        className="w-full flex items-start gap-2.5 text-left"
                      >
                        <span
                          className={cn(
                            'mt-0.5 h-5 w-5 rounded-md border flex items-center justify-center shrink-0',
                            item.checked
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          )}
                        >
                          {item.checked && <Check className="h-3.5 w-3.5" />}
                        </span>
                        <span
                          className={cn(
                            'text-sm text-slate-700 dark:text-slate-300 break-words',
                            item.checked && 'line-through text-slate-400 dark:text-slate-500'
                          )}
                        >
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {note.note_type === NOTE_TYPES.image && (
                  <div className="space-y-3">
                    {note.image_data && (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => openImagePreview(note.image_data, note.title)}
                        aria-label={`Open image from ${note.title}`}
                      >
                        <img
                          src={note.image_data}
                          alt={note.title}
                          className="w-full h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:brightness-95"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Tap to view full image</p>
                      </button>
                    )}
                    {note.body && (
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
                        {note.body}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                  Updated {format(new Date(note.updated_at || note.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showComposer}
        onClose={closeComposer}
        title={editingNote ? 'Edit note' : 'Create note'}
        description="Choose note type and save it to your account"
        size="lg"
      >
        <form onSubmit={handleSaveNote} className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Note type</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {typeOptions.map((option) => {
                const Icon = option.icon;
                const selected = draft.noteType === option.key;

                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => handleTypeChange(option.key)}
                    className={cn(
                      'border rounded-xl p-3 text-left transition-colors',
                      selected
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 text-[var(--color-primary)]" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{option.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{option.helper}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Title"
            value={draft.title}
            onChange={(event) => setDraftField('title', event.target.value)}
            placeholder="Note title"
            maxLength={120}
          />

          {draft.noteType === NOTE_TYPES.text && (
            <Textarea
              label="Body"
              value={draft.body}
              onChange={(event) => setDraftField('body', event.target.value)}
              placeholder="Write your note here"
              rows={5}
            />
          )}

          {draft.noteType === NOTE_TYPES.list && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={newItemText}
                  onChange={(event) => setNewItemText(event.target.value)}
                  placeholder="Add a checklist item"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddChecklistItem}>
                  Add item
                </Button>
              </div>

              {draft.checklistItems.length > 0 && (
                <div className="space-y-2 max-h-52 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                  {draft.checklistItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        className={cn(
                          'h-5 w-5 rounded-md border flex items-center justify-center',
                          item.checked
                            ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        )}
                        onClick={() => handleToggleDraftChecklistItem(item.id)}
                        aria-label="Toggle checklist item"
                      >
                        {item.checked && <Check className="h-3.5 w-3.5" />}
                      </button>
                      <span
                        className={cn(
                          'text-sm flex-1 text-slate-700 dark:text-slate-300',
                          item.checked && 'line-through text-slate-400 dark:text-slate-500'
                        )}
                      >
                        {item.text}
                      </span>
                      <button
                        type="button"
                        className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                        onClick={() => handleRemoveDraftChecklistItem(item.id)}
                        aria-label="Remove checklist item"
                      >
                        <X className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {draft.noteType === NOTE_TYPES.image && (
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-4">
                <Input type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              {draft.imageData && (
                <div className="relative">
                  <img
                    src={draft.imageData}
                    alt="Preview"
                    className="w-full max-h-64 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                  />
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setDraftField('imageData', null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <Textarea
                label="Caption (optional)"
                value={draft.body}
                onChange={(event) => setDraftField('body', event.target.value)}
                placeholder="Add caption or details"
                rows={3}
              />
            </div>
          )}

          {fileError && <p className="text-sm text-red-500 dark:text-red-400">{fileError}</p>}

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
            <Button type="button" variant="outline" onClick={closeComposer}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {editingNote ? 'Save changes' : 'Save note'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={handleDeleteNote}
        title="Delete note"
        description="This note will be permanently removed."
        confirmText="Delete"
        loading={deleteNote.isPending}
      />

      <Modal
        isOpen={!!previewImage}
        onClose={closeImagePreview}
        title={previewImage?.title || 'Image preview'}
        description="Full-size view"
        size="xl"
      >
        {previewImage?.src && (
          <img
            src={previewImage.src}
            alt={previewImage.title || 'Note image'}
            className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
          />
        )}
      </Modal>

      <button
        onClick={openCreateComposer}
        className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Add note"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

export default NotesPage;
