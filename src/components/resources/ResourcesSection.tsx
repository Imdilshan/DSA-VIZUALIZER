import { useState } from 'react';
import { ArrowLeft, BookOpen, Bookmark, FileText, Flame } from 'lucide-react';
import { ResourcesHub } from './ResourcesHub';
import { RESOURCES_DATA } from '../../data/resources/resourcesData';
import { ALGOARENA_CUSTOM_SHEET_INFO } from '../../data/resources/customSheetData';

type ResourceTab = 'sheets' | 'books' | 'learnshit-sheet';
const BOOKMARKS_KEY = 'learnshit-resource-bookmarks-v1';

function readBookmarks(): Set<string> {
  try {
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    return new Set(stored ? JSON.parse(stored) as string[] : []);
  } catch {
    return new Set();
  }
}

export function ResourcesSection({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<ResourceTab>('sheets');
  const [bookmarkedIds, setBookmarkedIds] = useState(readBookmarks);
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...next]));
      } catch {
        // Keep the current session usable when browser storage is unavailable.
      }
      return next;
    });
  };

  const tabs: { id: ResourceTab; label: string; icon: typeof FileText }[] = [
    { id: 'sheets', label: 'Sheets', icon: FileText },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'learnshit-sheet', label: 'LearnShit Sheet', icon: Flame },
  ];

  return (
    <section id="resources-anchor" className="resources-section">
      <header className="resources-topbar">
        <div className="resources-topbar-inner">
          <button type="button" className="resources-brand" onClick={onBack} aria-label="Return to LearnShit home">
            <span className="resources-brand-logo"><img src="/learnshit.svg" alt="" /></span>
            <span>LearnShit</span>
          </button>
          <button type="button" className="resources-back" onClick={onBack}><ArrowLeft size={14} /> Back to home</button>
        </div>
      </header>
      <div className="resources-shell">
        <header className="resources-heading">
          <div>
            <h2>Resources</h2>
            <p>Problem sheets, reference books, and LearnShit’s upcoming core sheet.</p>
          </div>
          <span className="resources-bookmark-count"><Bookmark size={14} /> {bookmarkedIds.size} saved</span>
        </header>

        <nav className="resources-tabs" aria-label="Resource subsections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)} aria-pressed={tab === id}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </nav>

        {tab === 'sheets' && (
          <ResourcesHub
            resources={RESOURCES_DATA.filter((resource) => resource.category === 'sheets')}
            categoryScope="sheets"
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            showOnlyBookmarks={showOnlyBookmarks}
            setShowOnlyBookmarks={setShowOnlyBookmarks}
            onNavigateToCustomSheet={() => setTab('learnshit-sheet')}
          />
        )}

        {tab === 'books' && (
          <ResourcesHub
            resources={RESOURCES_DATA.filter((resource) => resource.category === 'books')}
            categoryScope="books"
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            showOnlyBookmarks={showOnlyBookmarks}
            setShowOnlyBookmarks={setShowOnlyBookmarks}
            onNavigateToCustomSheet={() => setTab('learnshit-sheet')}
          />
        )}

        {tab === 'learnshit-sheet' && (
          <div className="learnshit-sheet-card">
            <span className="resources-eyebrow">COMING SOON · VERSION {ALGOARENA_CUSTOM_SHEET_INFO.version}</span>
            <h3>LearnShit Core Problem Sheet</h3>
            <p>{ALGOARENA_CUSTOM_SHEET_INFO.subtitle}</p>
            <p>A carefully ordered progression through foundational techniques and competitive programming patterns. Problem tracking and visualizer links are planned for a future release.</p>
            <div className="learnshit-sheet-topics">
              {ALGOARENA_CUSTOM_SHEET_INFO.topics.filter((topic) => topic !== 'All Topics').map((topic) => (
                <span key={topic}>{topic}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
