/* global React, ReactDOM */

const StatusBar = () => (
  <div className="status-bar">
    <div className="time">9:41</div>
    <div className="status-icons">
      <span className="icon-signal"></span>
      <span className="icon-wifi"></span>
      <span className="icon-battery"></span>
    </div>
  </div>
);

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
);

const Segmented = () => (
  <div className="segmented">
    <button className="seg-btn active" disabled>All</button>
    <button className="seg-btn" disabled>Pinned</button>
    <button className="seg-btn" disabled>Recently Edited</button>
  </div>
);

const NoteItem = ({ title, snippet, meta, active }) => (
  <li className={`note-item ${active ? 'active' : ''}`}>
    <div className="note-title">{title}</div>
    <div className="note-snippet">{snippet}</div>
    <div className="note-meta">{meta}</div>
  </li>
);

const Toolbar = () => (
  <div className="toolbar">
    <button className="tb-btn" aria-label="Checklist" disabled>☑︎</button>
    <button className="tb-btn" aria-label="Camera" disabled>📷</button>
    <button className="tb-btn primary" aria-label="New note" disabled>＋</button>
  </div>
);

const DetailPane = ({ note }) => (
  <div className="detail">
    <div className="detail-header">
      <h2>{note?.title || 'Untitled'}</h2>
    </div>
    <div className="detail-body">
      <pre>{note?.snippet || ''}</pre>
    </div>
  </div>
);

const App = () => {
  const sampleNotes = [
    { title: 'Welcome to Notes', snippet: 'This is a static preview. Buttons are not wired yet.', meta: 'Today • 10:12', active: true },
    { title: 'Design ideas', snippet: 'Sketch the iPhone-style interface and color palette.', meta: 'Yesterday • 18:45' },
    { title: 'Shopping list', snippet: 'Milk, coffee beans, oat milk, pasta, olive oil…', meta: 'Mon • 09:03' },
    { title: 'Project tasks', snippet: 'Scan backend endpoints; build clean UI; avoid wiring actions.', meta: 'Sun • 14:22' },
  ];

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
            {sampleNotes.map((n, idx) => (
              <NoteItem key={idx} {...n} />
            ))}
          </ul>
          <DetailPane note={sampleNotes[0]} />
        </div>
      </main>
      <Toolbar />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);


