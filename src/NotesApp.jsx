import React, { useEffect, useState, useMemo } from 'react'

const StatusBar = () => (
  <div className="status-bar">
    <div className="time">9:41</div>
    <div className="status-icons">
      <span className="icon-signal"></span>
      <span className="icon-wifi"></span>
      <span className="icon-battery"></span>
    </div>
  </div>
)

const Header = () => (
  <header className="app-header">
    <div className="header-left">
      <button className="header-btn" aria-label="Back" disabled>◁</button>
      <h1>Notes</h1>
    </div>
    <div className="header-actions">
      <button className="header-btn" aria-label="Folder" disabled>▤</button>
      <button className="header-btn" aria-label="More" disabled>⋯</button>
    </div>
  </header>
)

const Segmented = () => (
  <div className="segmented">
    <button className="seg-btn active" disabled>All</button>
    <button className="seg-btn" disabled>Pinned</button>
    <button className="seg-btn" disabled>Recently Edited</button>
  </div>
)

const NoteItem = ({ title, snippet, meta, active, onClick }) => (
  <li className={`note-item ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="note-title">{title}</div>
    <div className="note-snippet">{snippet}</div>
    <div className="note-meta">{meta}</div>
  </li>
)

const Toolbar = ({ onDelete, onCreate, isBusy }) => (
  <div className="toolbar">
    <button className="tb-btn" aria-label="Delete" onClick={onDelete} disabled={isBusy}>☑︎</button>
    <button className="tb-btn" aria-label="Unused" disabled>📷</button>
    <button className="tb-btn primary" aria-label="New note" onClick={onCreate} disabled={isBusy}>＋</button>
  </div>
)

const DetailPane = ({ note }) => {
  if (!note) {
    return (
      <div className="detail empty">
        <div className="empty-state">
          <h2>Select a note</h2>
          <p>Your note content will appear here.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="detail">
      <div className="detail-header">
        <h2>{note.title || 'Untitled'}</h2>
      </div>
      <div className="detail-body">
        <pre>{(note.content ?? '').trim() || ' '}</pre>
      </div>
    </div>
  )
}

export default function NotesApp() {
  const sampleNotes = [
    { title: 'Welcome to Notes', snippet: 'This is a static preview. Buttons are not wired yet.', meta: 'Today • 10:12', active: true },
    { title: 'Design ideas', snippet: 'Sketch the iPhone-style interface and color palette.', meta: 'Yesterday • 18:45' },
    { title: 'Shopping list', snippet: 'Milk, coffee beans, oat milk, pasta, olive oil…', meta: 'Mon • 09:03' },
    { title: 'Project tasks', snippet: 'Scan backend endpoints; build clean UI; avoid wiring actions.', meta: 'Sun • 14:22' },
  ]

  const [notes, setNotes] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const activeNote = useMemo(() => (notes && notes[activeIndex]) || null, [notes, activeIndex])

  useEffect(() => {
    let cancelled = false
    async function loadNotes() {
      try {
        const res = await fetch('/api/notes', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        const mapped = (Array.isArray(data) ? data : []).map((n) => ({
          id: n.id,
          title: n.title ?? 'Untitled',
          content: n.content ?? '',
        }))
        if (mapped.length > 0) {
          setNotes(mapped)
          setActiveIndex(0)
        }
      } catch {
        // stay on sample notes if backend not available
      }
    }
    loadNotes()
    return () => { cancelled = true }
  }, [])

  async function createNote() {
    try {
      setBusy(true)
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title: 'New note', content: '' }),
      })
      if (!res.ok) return
      const created = await res.json()
      setNotes((prev) => {
        const next = (prev ?? []).slice()
        next.unshift({ id: created.id, title: created.title ?? 'Untitled', content: created.content ?? '' })
        return next
      })
      setActiveIndex(0)
    } finally {
      setBusy(false)
    }
  }

  async function deleteActive() {
    if (!notes || notes.length === 0) return
    const current = notes[activeIndex]
    if (!current || current.id == null) return
    try {
      setBusy(true)
      const res = await fetch(`/api/notes/${current.id}`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok && res.status !== 204) return
      setNotes((prev) => {
        const next = (prev ?? []).slice()
        next.splice(activeIndex, 1)
        return next
      })
      setActiveIndex((i) => Math.max(0, i - 1))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <StatusBar />
      <Header />
      <main className="app-content">
        <div className="search-wrap">
          <input className="search" type="search" placeholder="Search" />
        </div>
        <Segmented />
        <div className="main-grid">
          <ul className="note-list">
            {(notes ? notes.map((n, idx) => ({
              title: n.title,
              snippet: (n.content ?? '').slice(0, 120) || ' ',
              meta: n.id != null ? `#${n.id}` : `#${idx}`,
              active: idx === activeIndex,
              onClick: () => setActiveIndex(idx),
            })) : sampleNotes).map((n, idx) => (
              <NoteItem key={idx} {...n} />
            ))}
          </ul>
          <DetailPane note={activeNote} />
        </div>
      </main>
      <Toolbar onCreate={createNote} onDelete={deleteActive} isBusy={busy} />
    </div>
  )
}


