import React, { useState, useEffect, useRef } from 'react';
import { 
  StoryState, Folder, Character, DialogItem, 
  GENDERS, GENRES, LANGUAGES 
} from './types';
import { DEFAULT_FOLDERS, DEFAULT_STORY, EXAMPLE_STORY } from './constants';
import { generateStoryPlotJSON, generateStoryNarrative } from './services/geminiService';
import { 
  FolderPlus, FileText, Plus, Trash2, 
  ChevronRight, ChevronDown, Wand2, Play, 
  Save, Layout, Menu, X, ArrowRight
} from 'lucide-react';

const App = () => {
  // --- State Management ---
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [stories, setStories] = useState<StoryState[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchLang, setSearchLang] = useState('');

  // Derived active story
  const activeStory = stories.find(s => s.id === activeStoryId) || null;

  // --- Effects ---
  
  // Initialize with a default story if empty
  useEffect(() => {
    if (stories.length === 0) {
      const newStory = { ...DEFAULT_STORY, id: 'story_' + Date.now(), folderId: folders[0].id };
      setStories([newStory]);
      setActiveStoryId(newStory.id);
    }
  }, [stories.length, folders]);

  // --- Handlers: Folders & Stories ---

  const handleAddFolder = () => {
    const name = prompt("Nama Folder Baru:");
    if (name) {
      setFolders([...folders, { id: 'f_' + Date.now(), name }]);
    }
  };

  const handleCreateStory = (folderId: string) => {
    const newStory: StoryState = {
      ...DEFAULT_STORY,
      id: 'story_' + Date.now(),
      folderId,
      mainTitle: 'Cerita Baru'
    };
    setStories([...stories, newStory]);
    setActiveStoryId(newStory.id);
  };

  const updateActiveStory = (field: keyof StoryState, value: any) => {
    if (!activeStoryId) return;
    setStories(prev => prev.map(s => s.id === activeStoryId ? { ...s, [field]: value } : s));
  };

  // --- Handlers: Form Arrays (Characters/Dialogs) ---

  const addCharacter = () => {
    const newChar: Character = {
      id: 'c_' + Date.now(),
      name: '',
      gender: GENDERS[0],
      age: '',
      ageDescription: '',
      role: 'Pendukung'
    };
    updateActiveStory('characters', [...(activeStory?.characters || []), newChar]);
  };

  const updateCharacter = (id: string, field: keyof Character, value: string) => {
    const chars = activeStory?.characters.map(c => c.id === id ? { ...c, [field]: value } : c) || [];
    updateActiveStory('characters', chars);
  };

  const removeCharacter = (id: string) => {
    const chars = activeStory?.characters.filter(c => c.id !== id) || [];
    updateActiveStory('characters', chars);
  };

  const addDialog = () => {
    const newDialog: DialogItem = {
      id: 'd_' + Date.now(),
      speaker: activeStory?.characters[0]?.name || '',
      mood: '',
      bodyCondition: '',
      text: '',
      description: ''
    };
    updateActiveStory('dialogs', [...(activeStory?.dialogs || []), newDialog]);
  };

  const updateDialog = (id: string, field: keyof DialogItem, value: string) => {
    const dialogs = activeStory?.dialogs.map(d => d.id === id ? { ...d, [field]: value } : d) || [];
    updateActiveStory('dialogs', dialogs);
  };

  const removeDialog = (id: string) => {
    const dialogs = activeStory?.dialogs.filter(d => d.id !== id) || [];
    updateActiveStory('dialogs', dialogs);
  };

  // --- Handlers: Genre ---
  const toggleGenre = (genre: string) => {
    const current = activeStory?.genres || [];
    const updated = current.includes(genre)
      ? current.filter(g => g !== genre)
      : [...current, genre];
    updateActiveStory('genres', updated);
  };

  // --- Handlers: Actions ---

  const fillExample = () => {
    if (!activeStoryId) return;
    setStories(prev => prev.map(s => s.id === activeStoryId ? { ...s, ...EXAMPLE_STORY } : s));
  };

  const handleGenerate = async () => {
    if (!activeStory) return;
    setIsGenerating(true);
    try {
      // 1. Generate JSON Plot
      const jsonStr = await generateStoryPlotJSON(activeStory);
      updateActiveStory('generatedJson', jsonStr);

      // 2. Generate Narrative Content based on the plot
      const narrative = await generateStoryNarrative(activeStory, jsonStr);
      updateActiveStory('generatedContent', narrative);

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat generate AI. Pastikan API Key valid.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextChapter = () => {
    if (!activeStory) return;
    
    // Create new story entry but keep context (Title, Characters, Settings)
    // But reset Chapter specific info
    const newChapter: StoryState = {
      ...activeStory,
      id: 'story_' + Date.now(),
      chapterNumber: (activeStory.chapterNumber || 0) + 1,
      chapterTitle: '', // Reset
      dialogs: [], // Reset dialogs for new chapter
      generatedJson: null,
      generatedContent: null,
      // Keep characters, environment, location, genres as context
    };

    setStories([...stories, newChapter]);
    setActiveStoryId(newChapter.id);
    
    // Scroll to top or alert
    alert(`Berhasil lanjut ke Chapter ${newChapter.chapterNumber}`);
  };

  // --- Render Helpers ---

  if (!activeStory) return <div className="flex h-screen items-center justify-center text-slate-400">Memuat...</div>;

  return (
    <div className="flex h-screen bg-dark overflow-hidden">
      
      {/* --- Sidebar (Folders) --- */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-surface border-r border-slate-700 flex flex-col shrink-0 overflow-hidden`}>
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-lg text-primary">NusaCerita</h2>
          <button onClick={handleAddFolder} className="p-1 hover:bg-slate-700 rounded" title="Tambah Folder">
            <FolderPlus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {folders.map(folder => (
            <div key={folder.id} className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 text-slate-400 font-medium text-xs uppercase tracking-wider mb-1">
                {folder.name}
                <button onClick={() => handleCreateStory(folder.id)} className="hover:text-white">
                  <Plus size={14} />
                </button>
              </div>
              <ul className="space-y-1">
                {stories.filter(s => s.folderId === folder.id).map(story => (
                  <li key={story.id}>
                    <button 
                      onClick={() => setActiveStoryId(story.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm truncate flex flex-col ${activeStoryId === story.id ? 'bg-slate-700 text-white border-l-2 border-primary' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <span className="font-medium truncate">{story.mainTitle || '(Tanpa Judul)'}</span>
                      <span className="text-[10px] opacity-70">Ch.{story.chapterNumber} : {story.chapterTitle || '...'}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header / Top Bar */}
        <header className="h-14 bg-surface border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-700 rounded text-slate-400">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 font-mono">DRAFT EDITOR</span>
              <h1 className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                {activeStory.mainTitle} <span className="text-slate-500 mx-2">/</span> Chapter {activeStory.chapterNumber}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
              onClick={fillExample}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded text-slate-200 transition-colors"
            >
              <Layout size={14} />
              Isi Contoh
            </button>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-bold shadow-lg transition-all ${isGenerating ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110'}`}
            >
              {isGenerating ? <span className="animate-spin">⌛</span> : <Wand2 size={16} />}
              {isGenerating ? 'Generating...' : 'Generate Plot & Story'}
            </button>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
            
            {/* LEFT COLUMN: INPUTS */}
            <div className="space-y-6">
              
              {/* 1. Basic Info */}
              <Section title="Informasi Dasar">
                <div className="grid grid-cols-1 gap-4">
                  <Input 
                    label="Judul Cerita Utama" 
                    placeholder="Contoh: Sang Penakluk Naga" 
                    value={activeStory.mainTitle} 
                    onChange={v => updateActiveStory('mainTitle', v)} 
                  />
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-1">
                       <Input 
                        label="No. Chapter" 
                        type="number"
                        value={activeStory.chapterNumber} 
                        onChange={v => updateActiveStory('chapterNumber', parseInt(v))} 
                      />
                    </div>
                    <div className="col-span-3">
                      <Input 
                        label="Judul Chapter" 
                        placeholder="Judul bab ini..."
                        value={activeStory.chapterTitle} 
                        onChange={v => updateActiveStory('chapterTitle', v)} 
                      />
                    </div>
                  </div>
                </div>
              </Section>

              {/* 2. Language & Genre */}
              <Section title="Bahasa & Genre">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Bahasa</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Cari Bahasa..."
                        className="w-full bg-input border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                        value={searchLang}
                        onChange={(e) => setSearchLang(e.target.value)}
                        onFocus={() => setSearchLang('')} // clear on focus to show list
                      />
                      {searchLang && (
                         <div className="absolute top-full left-0 right-0 z-10 bg-slate-800 border border-slate-600 rounded mt-1 max-h-40 overflow-y-auto shadow-xl">
                           {LANGUAGES.filter(l => l.toLowerCase().includes(searchLang.toLowerCase())).map(l => (
                             <button key={l} 
                              className="w-full text-left px-3 py-2 text-sm hover:bg-slate-700 text-slate-300"
                              onClick={() => { updateActiveStory('language', l); setSearchLang(l); }}
                             >
                               {l}
                             </button>
                           ))}
                         </div>
                      )}
                      <div className="mt-1 text-xs text-primary">Terpilih: {activeStory.language}</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2">Genre (Checklist)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {GENRES.map(g => (
                        <button
                          key={g}
                          onClick={() => toggleGenre(g)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors border ${activeStory.genres.includes(g) ? 'bg-primary/20 border-primary text-primary' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    <textarea 
                      className="w-full bg-input border-transparent focus:border-slate-600 rounded p-2 text-xs text-slate-300 h-16 resize-none"
                      placeholder="Deskripsi genre tambahan (misal: Gabungan elemen magis kuno dengan teknologi masa depan)"
                      value={activeStory.genreDesc}
                      onChange={e => updateActiveStory('genreDesc', e.target.value)}
                    />
                  </div>
                </div>
              </Section>

              {/* 3. Setting / Latar */}
              <Section title="Latar & Lokasi">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input 
                        label="Lingkungan" 
                        placeholder="Misal: Hutan Hujan" 
                        value={activeStory.environment} 
                        onChange={v => updateActiveStory('environment', v)} 
                      />
                      <textarea 
                         className="mt-2 w-full bg-input border border-slate-600 rounded p-2 text-xs text-slate-300 h-20 resize-none focus:border-primary outline-none"
                         placeholder="Deskripsi detail suasana..."
                         value={activeStory.environmentDesc}
                         onChange={e => updateActiveStory('environmentDesc', e.target.value)}
                      />
                    </div>
                    <div>
                      <Input 
                        label="Lokasi Spesifik" 
                        placeholder="Misal: Desa Penari" 
                        value={activeStory.location} 
                        onChange={v => updateActiveStory('location', v)} 
                      />
                      <textarea 
                         className="mt-2 w-full bg-input border border-slate-600 rounded p-2 text-xs text-slate-300 h-20 resize-none focus:border-primary outline-none"
                         placeholder="Detail geografis & visual..."
                         value={activeStory.locationDesc}
                         onChange={e => updateActiveStory('locationDesc', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Section>

              {/* 4. Characters */}
              <Section title="Karakter">
                <div className="space-y-4">
                  {activeStory.characters.map((char, idx) => (
                    <div key={char.id} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-primary">#{idx + 1}</span>
                        <button onClick={() => removeCharacter(char.id)} className="text-slate-500 hover:text-red-400"><Trash2 size={14}/></button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                         <Input label="Nama" value={char.name} onChange={v => updateCharacter(char.id, 'name', v)} />
                         <div className="flex flex-col">
                            <label className="text-[10px] text-slate-400 mb-1">Gender</label>
                            <select 
                              value={char.gender} 
                              onChange={e => updateCharacter(char.id, 'gender', e.target.value)}
                              className="bg-input border border-slate-600 rounded py-2 px-2 text-xs text-white focus:outline-none focus:border-primary"
                            >
                              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                         </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="col-span-1">
                           <Input label="Usia" value={char.age} onChange={v => updateCharacter(char.id, 'age', v)} />
                        </div>
                        <div className="col-span-2">
                           <Input label="Peran" value={char.role} onChange={v => updateCharacter(char.id, 'role', v)} placeholder="Protagonis/Antagonis" />
                        </div>
                      </div>
                      <Input 
                        label="Deskripsi Fisik & Sifat" 
                        value={char.ageDescription} 
                        onChange={v => updateCharacter(char.id, 'ageDescription', v)} 
                        placeholder="Rambut perak, mata tajam, sifat periang..." 
                      />
                    </div>
                  ))}
                  <button onClick={addCharacter} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-400 text-xs hover:bg-slate-800 hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <Plus size={14} /> Tambah Karakter
                  </button>
                </div>
              </Section>

               {/* 5. Dialogs */}
               <Section title="Dialog & Interaksi Kunci">
                <div className="space-y-4">
                  {activeStory.dialogs.map((dialog, idx) => (
                    <div key={dialog.id} className="bg-slate-800/50 p-3 rounded border border-slate-700/50 hover:border-slate-600 transition-colors relative group">
                       <button onClick={() => removeDialog(dialog.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                       
                       <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className="col-span-1">
                             <label className="text-[10px] text-slate-400 mb-1">Pembicara</label>
                             <select 
                                value={dialog.speaker} 
                                onChange={e => updateDialog(dialog.id, 'speaker', e.target.value)}
                                className="w-full bg-input border border-slate-600 rounded py-1.5 px-2 text-xs text-white"
                             >
                                <option value="">Pilih...</option>
                                {activeStory.characters.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                             </select>
                          </div>
                          <div className="col-span-1">
                             <Input label="Suasana Hati" value={dialog.mood} onChange={v => updateDialog(dialog.id, 'mood', v)} placeholder="Marah/Sedih" />
                          </div>
                          <div className="col-span-1">
                             <Input label="Kondisi Tubuh" value={dialog.bodyCondition} onChange={v => updateDialog(dialog.id, 'bodyCondition', v)} placeholder="Luka/Lelah" />
                          </div>
                       </div>
                       
                       <div className="mb-2">
                         <label className="block text-[10px] text-slate-400 mb-1">Isi Dialog</label>
                         <textarea 
                            className="w-full bg-input border border-slate-600 rounded p-2 text-xs text-white h-16 focus:border-primary outline-none"
                            value={dialog.text}
                            onChange={e => updateDialog(dialog.id, 'text', e.target.value)}
                            placeholder="Ketik dialog di sini..."
                         />
                       </div>
                       <Input label="Deskripsi Tambahan / Konteks" value={dialog.description} onChange={v => updateDialog(dialog.id, 'description', v)} placeholder="Apa yang terjadi saat bicara?" />
                    </div>
                  ))}
                   <button onClick={addDialog} className="w-full py-2 border border-dashed border-slate-600 rounded text-slate-400 text-xs hover:bg-slate-800 hover:text-primary transition-colors flex items-center justify-center gap-1">
                    <Plus size={14} /> Tambah Dialog
                  </button>
                </div>
               </Section>

            </div>

            {/* RIGHT COLUMN: PREVIEW & OUTPUT */}
            <div className="space-y-6">
               <Section title="Preview Output (JSON Plot)">
                  <div className="bg-slate-900 rounded-md border border-slate-700 p-4 h-64 overflow-y-auto font-mono text-xs text-green-400">
                    {activeStory.generatedJson ? (
                      <pre className="whitespace-pre-wrap">{activeStory.generatedJson}</pre>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 italic">
                        <FileText size={32} className="mb-2 opacity-50"/>
                        <p>Plot JSON belum digenerate.</p>
                        <p className="text-[10px]">Klik tombol "Generate" di pojok kanan atas.</p>
                      </div>
                    )}
                  </div>
               </Section>

               <Section title="Hasil Cerita (Preview)">
                  <div className="bg-slate-900 rounded-md border border-slate-700 p-6 min-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none">
                     {activeStory.generatedContent ? (
                       <div className="whitespace-pre-wrap leading-relaxed text-slate-300">
                         {activeStory.generatedContent}
                       </div>
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 italic mt-10">
                           <p>Belum ada cerita yang dihasilkan.</p>
                        </div>
                     )}
                  </div>
               </Section>

               {/* Action: Next Chapter */}
               <div className="sticky bottom-4 z-10">
                 <button 
                  onClick={handleNextChapter}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white py-4 rounded-lg shadow-lg flex items-center justify-center gap-3 transition-all group"
                 >
                   <span className="font-bold">Lanjut ke Chapter Selanjutnya ({activeStory.chapterNumber + 1})</span>
                   <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                 </button>
               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

// --- Reusable UI Components ---

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="bg-surface rounded-lg border border-slate-700 shadow-sm overflow-hidden">
    <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700">
      <h3 className="font-semibold text-sm text-slate-200">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }: { 
  label: string, value: any, onChange: (val: string) => void, placeholder?: string, type?: string 
}) => (
  <div className="flex flex-col">
    <label className="text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wide">{label}</label>
    <input 
      type={type}
      className="bg-input border border-slate-600 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export default App;