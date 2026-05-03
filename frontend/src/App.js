import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function NoteCard({ note, onDelete }) {
  return (
    <div className="note-card">
      <h3>{note.title || "Untitled"}</h3>
      <div style={{fontSize:12,color:'var(--muted)',marginBottom:8}}>{note.status}</div>
      <p>{note.content}</p>
      <div className="meta">
        <small>{new Date(note.createdAt || Date.now()).toLocaleDateString()}</small>
        <div style={{display:'flex',gap:8}}>
          <button className="delete" onClick={() => onDelete(note._id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('learning');
  const [showFormMobile, setShowFormMobile] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/notes");
      setNotes(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // load draft from localStorage
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem('devnotes:draft')) || {};
      if (draft.title) setTitle(draft.title);
      if (draft.content) setContent(draft.content);
      if (draft.status) setStatus(draft.status);
    } catch (e) {}
  }, []);

  // autosave draft (title, content, status)
  useEffect(() => {
    const data = { title, content, status };
    localStorage.setItem('devnotes:draft', JSON.stringify(data));
  }, [title, content, status]);

  const addNote = async () => {
    try {
      if (!title.trim() && !content.trim()) return;
      if (selected) {
        // update
        await axios.put(`http://localhost:5000/api/notes/${selected._id}`, { title, content, status });
        setToast('Note updated');
      } else {
        await axios.post("http://localhost:5000/api/notes", { title, content, status });
        setToast('Note added');
      }
      setTitle("");
      setContent("");
      setStatus('learning');
      setSelected(null);
      setShowFormMobile(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
      setToast(err?.response?.data?.error || 'Failed');
    } finally {
      setTimeout(() => setToast(''), 2800);
    }
  };

  const deleteNote = async (id) => {
    try {
      if (!window.confirm('Delete this note?')) return;
      await axios.delete(`http://localhost:5000/api/notes/${id}`);
      fetchNotes();
      setToast('Note deleted');
    } catch (err) {
      console.error(err);
      setToast('Failed to delete');
    } finally {
      setTimeout(() => setToast(''), 2800);
    }
  };

  const startEdit = (note) => {
    setSelected(note);
    setTitle(note.title);
    setContent(note.content);
    setStatus(note.status || 'learning');
    window.scrollTo({top:0,behavior:'smooth'});
    setShowFormMobile(true);
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="brand">
          <div className="logo" />
          <div>
            <h1>DevNotes</h1>
            <p>Quick notes for developers</p>
          </div>
        </div>

        <div style={{display:'flex',gap:12,alignItems:'center'}}>
          <input className="search" placeholder="Search notes..." value={query} onChange={e=>setQuery(e.target.value)} />
          <div className="topbar-actions">
            <button className="btn">Import</button>
            <button className="btn">Export</button>
            <button className="btn primary" onClick={fetchNotes}>Refresh</button>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <h2 style={{margin:0}}>All Notes</h2>
            <small style={{color:'var(--muted)'}}>{loading ? 'Loading…' : `${notes.length} notes`}</small>
          </div>

          <div className="notes-grid">
            {notes.filter(n => {
              if (!query.trim()) return true;
              const q = query.toLowerCase();
              return (n.title||'').toLowerCase().includes(q) || (n.content||'').toLowerCase().includes(q);
            }).map((n) => (
              <div key={n._id} style={{position:'relative'}}>
                <NoteCard note={n} onDelete={deleteNote} />
                <div style={{position:'absolute',top:10,right:10,display:'flex',gap:6}}>
                  <button className="btn" onClick={() => startEdit(n)}>Edit</button>
                </div>
              </div>
            ))}

            {notes.length === 0 && (
              <div className="empty-state" style={{padding:34,textAlign:'center',gridColumn:'1/-1'}}>
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="120" height="80" rx="12" fill="rgba(255,255,255,0.02)"/>
                  <path d="M20 50C28 36 44 28 60 28C76 28 92 36 100 50" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <h3 style={{marginTop:12}}>No notes yet</h3>
                <p style={{color:'var(--muted)'}}>Create your first note using the form on the right.</p>
              </div>
            )}
          </div>
        </section>

        <aside className={"panel " + (showFormMobile ? 'mobile-visible' : 'mobile-hidden')}>
          <h3 style={{marginTop:0}}>Create Note</h3>
          <div className="note-form">
            <label>Title</label>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />

            <label style={{marginTop:10}}>Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} style={{width:'100%',padding:8,borderRadius:8,background:'transparent',border:'1px solid rgba(255,255,255,0.04)',color:'var(--text)'}}>
              <option value="learning">learning</option>
              <option value="idea">idea</option>
              <option value="todo">todo</option>
              <option value="done">done</option>
            </select>

            <label style={{marginTop:10}}>Content</label>
            <textarea rows={8} placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
              <small style={{color:'var(--muted)'}}>{content.length} chars</small>
              <small style={{color:'var(--muted)'}}>{Math.max(0, 280 - content.length)} left</small>
            </div>

            <div className="actions">
              <button className="btn" onClick={() => { setTitle(''); setContent(''); setStatus('learning'); setSelected(null); setShowFormMobile(false); }}>Clear</button>
              <button className="btn" onClick={() => { setTitle(selected?.title||''); setContent(selected?.content||''); }}>Reset</button>
              <button className="btn primary" onClick={addNote}>{selected ? 'Save Changes' : 'Add Note'}</button>
            </div>
          </div>
        </aside>
      </main>

      {toast && <div className="toast">{toast}</div>}

      <button className="fab" onClick={() => setShowFormMobile(s => !s)} aria-label="Toggle create note">+</button>
    </div>
  );
}

export default App;
