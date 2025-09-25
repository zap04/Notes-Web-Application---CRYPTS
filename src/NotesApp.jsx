import React, { useEffect, useState, useMemo, useCallback } from 'react'

const Header = ({ onCreateNote, isCreating }) => (
  <header className="app-header">
    <div className="header-content">
      <h1>Notes</h1>
      <div className="header-actions">
        <button
          className="header-btn primary"
          aria-label="New Note"
          onClick={onCreateNote}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : '+ New Note'}
        </button>
      </div>
    </div>
  </header>
)

const Sidebar = ({ activeFilter, onFilterChange, sortBy, onSortChange }) => (
  <div className="sidebar">
    <div className="sidebar-header">
      <h2>All Notes</h2>
      <div className="sidebar-actions">
        <select
          className="sidebar-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title">Title</option>
        </select>
      </div>
    </div>
    <div className="sidebar-filters">
      <button
        className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
        onClick={() => onFilterChange('all')}
      >
        All
      </button>
      <button
        className={`filter-btn ${activeFilter === 'pinned' ? 'active' : ''}`}
        onClick={() => onFilterChange('pinned')}
      >
        Pinned
      </button>
      <button
        className={`filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
        onClick={() => onFilterChange('recent')}
      >
        Recent
      </button>
    </div>
  </div>
)

const NoteItem = ({ title, snippet, meta, active, onClick, pinned }) => (
  <li className={`note-item ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="note-title">
      {title} {pinned && <span className="pin-icon">📌</span>}
    </div>
    <div className="note-snippet">{snippet}</div>
    <div className="note-meta">{meta}</div>
  </li>
);

const NoteActions = ({ note, onDelete, onShare, onExport, onTogglePin, isBusy }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: note?.title || 'Untitled',
        text: note?.content || '',
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(note?.content || '').then(() => {
        alert('Note content copied to clipboard!');
      });
    }
  };

  const handleExport = () => {
    const content = `# ${note?.title || 'Untitled'}\n\n${note?.content || ''}`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note?.title || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="note-actions">
      {/* Pin/Unpin */}
      <button
        className="action-btn"
        aria-label="Pin"
        onClick={() => onTogglePin && onTogglePin(note)}
        disabled={isBusy || !note}
      >
        {note?.pinned ? '📌 Unpin' : '📍 Pin'}
      </button>

      <button
        className="action-btn danger"
        aria-label="Delete"
        onClick={onDelete}
        disabled={isBusy || !note}
      >
        🗑️ Delete
      </button>

      <button
        className="action-btn"
        aria-label="Share"
        onClick={handleShare}
        disabled={!note}
      >
        📤 Share
      </button>

      <button
        className="action-btn"
        aria-label="Export"
        onClick={handleExport}
        disabled={!note}
      >
        📄 Export
      </button>
    </div>
  );
};

const DetailPane = ({ note, onUpdateNote, isUpdating }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    setIsEditing(false);
  }, [note]);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleContentChange = (e) => setContent(e.target.value);

  const handleTitleBlur = () => {
    if (note && onUpdateNote) onUpdateNote(note.id, { title, content });
  };

  const handleContentBlur = () => {
    if (note && onUpdateNote) onUpdateNote(note.id, { title, content });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsEditing(false);
  };

  if (!note) {
    return (
      <div className="detail empty">
        <div className="empty-state">
          <h2>Select a note</h2>
          <p>Choose a note from the sidebar to view and edit its content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detail">
      <div className="detail-header">
        <input
          className="note-title-input"
          value={title}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onFocus={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          placeholder="Untitled"
          disabled={isUpdating}
        />
        <div className="detail-meta">
          <span>Last modified: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <div className="detail-body">
        <textarea
          className="note-editor"
          value={content}
          onChange={handleContentChange}
          onBlur={handleContentBlur}
          onFocus={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          placeholder="Start writing your note..."
          disabled={isUpdating}
        />
      </div>
    </div>
  );
};

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [busy, setBusy] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  const activeNote = useMemo(
    () => (filteredNotes && filteredNotes[activeIndex]) || null,
    [filteredNotes, activeIndex]
  );

  // Load notes from backend
  useEffect(() => {
    let cancelled = false;
    async function loadNotes() {
      try {
        setBusy(true);
        setError(null);

        // optional health check
        try {
          await fetch('/api/notes/health');
        } catch (e) {
          // ignore health check failure
        }

        const res = await fetch('/api/notes', { credentials: 'include' });
        if (!res.ok) throw new Error(`Failed to load notes: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        const mapped = (Array.isArray(data) ? data : []).map((n) => ({
          id: n.id,
          title: n.title ?? 'Untitled',
          content: n.content ?? '',
          pinned: n.pinned ?? false, // minimal addition
          createdAt: n.createdAt || new Date().toISOString(),
          updatedAt: n.updatedAt || new Date().toISOString(),
        }));
        setNotes(mapped);
        setActiveIndex(0);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          console.error('Failed to load notes:', err);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    loadNotes();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter and sort notes
  useEffect(() => {
    let filtered = [...notes];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          (note.title || '').toLowerCase().includes(query) ||
          (note.content || '').toLowerCase().includes(query)
      );
    }

    if (activeFilter === 'pinned') {
      // minimal fix: filter by pinned
      filtered = filtered.filter((note) => note.pinned);
    } else if (activeFilter === 'recent') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter((note) => new Date(note.updatedAt) > oneDayAgo);
    }

    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
    
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'newest':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });    

    setFilteredNotes(filtered);
    setActiveIndex(0);
  }, [notes, searchQuery, activeFilter, sortBy]);

  const createNote = useCallback(async () => {
    try {
      setIsCreating(true);
      setError(null);

      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ title: 'New note', content: ' ' }),
      });

      if (!res.ok) {
        let errorMessage = `Failed to create note: ${res.status}`;
        try {
          const errorData = await res.json();
          if (errorData.message) errorMessage += ` - ${errorData.message}`;
          else if (errorData.error) errorMessage += ` - ${errorData.error}`;
        } catch (e) {
          const errorText = await res.text();
          errorMessage += ` - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      const created = await res.json();
      const newNote = {
        id: created.id,
        title: created.title ?? 'Untitled',
        content: created.content ?? '',
        pinned: created.pinned ?? false,
        createdAt: created.createdAt || new Date().toISOString(),
        updatedAt: created.updatedAt || new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      setActiveIndex(0);
    } catch (err) {
      setError(err.message);
      console.error('Failed to create note:', err);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const deleteActive = useCallback(async () => {
    if (!activeNote || !activeNote.id) return;

    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      setBusy(true);
      setError(null);
      const res = await fetch(`/api/notes/${activeNote.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok && res.status !== 204) {
        throw new Error(`Failed to delete note: ${res.status}`);
      }
      setNotes((prev) => prev.filter((note) => note.id !== activeNote.id));
      setActiveIndex((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete note:', err);
    } finally {
      setBusy(false);
    }
  }, [activeNote]);

  const updateNote = useCallback(async (noteId, updates) => {
    try {
      setIsUpdating(true);
      setError(null);
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        throw new Error(`Failed to update note: ${res.status}`);
      }
      const updated = await res.json();
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, ...updated, updatedAt: updated.updatedAt || new Date().toISOString() }
            : note
        )
      );      
    } catch (err) {
      setError(err.message);
      console.error('Failed to update note:', err);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  // Minimal new function: reuse updateNote to flip pinned
  const togglePin = useCallback(
    async (note) => {
      if (!note || !note.id) return;
      try {
        await updateNote(note.id, {
          title: note.title,
          content: note.content,
          pinned: !note.pinned,
        });
      } catch (err) {
        console.error('Failed to toggle pin:', err);
        setError(err?.message || 'Failed to toggle pin');
      }
    },
    [updateNote]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            createNote();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector('.search')?.focus();
            break;
          case 'Delete':
            e.preventDefault();
            deleteActive();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [createNote, deleteActive]);

  return (
    <div className="app-shell">
      <Header onCreateNote={createNote} isCreating={isCreating} />
      {error && (
        <div className="error-banner">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}
      <div className="app-layout">
        <div className="sidebar-section">
          <Sidebar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          <div className="search-section">
            <input
              className="search"
              type="search"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <ul className="note-list">
            {busy && filteredNotes.length === 0 ? (
              <li className="note-item loading">Loading notes...</li>
            ) : filteredNotes.length === 0 ? (
              <li className="note-item empty">
                {searchQuery ? 'No notes found matching your search.' : 'No notes yet. Create your first note!'}
              </li>
            ) : (
              filteredNotes.map((note, idx) => (
                <NoteItem
                  key={note.id}
                  title={note.title}
                  snippet={note.content.slice(0, 120) || ' '}
                  meta={new Date(note.updatedAt).toLocaleDateString()}
                  active={idx === activeIndex}
                  pinned={note.pinned}
                  onClick={() => setActiveIndex(idx)}
                />
              ))              
            )}
          </ul>
        </div>

        <div className="content-section">
          <DetailPane note={activeNote} onUpdateNote={updateNote} isUpdating={isUpdating} />
          <NoteActions
            note={activeNote}
            onDelete={deleteActive}
            onShare={() => {}}
            onExport={() => {}}
            onTogglePin={togglePin}
            isBusy={busy}
          />
        </div>
      </div>
    </div>
  );
}
