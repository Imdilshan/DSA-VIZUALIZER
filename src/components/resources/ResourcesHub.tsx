import { useState, useMemo, type FC } from 'react';
import { 
  Search, 
  LayoutGrid, 
  List, 
  RotateCcw, 
  Bookmark, 
  FileText, 
  Trophy, 
  BookOpen, 
  Video, 
  Star,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import type { ResourceItem, ResourceCategory, DifficultyLevel } from '../../types/resources/resource';
import { CatalogEngine } from '../../domain/resources/catalogEngine';

interface ResourcesHubProps {
  resources: ResourceItem[];
  categoryScope?: ResourceCategory;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (id: string) => void;
  showOnlyBookmarks: boolean;
  setShowOnlyBookmarks: (val: boolean) => void;
  onNavigateToCustomSheet: () => void;
}

export const ResourcesHub: FC<ResourcesHubProps> = ({
  resources,
  categoryScope,
  bookmarkedIds,
  onToggleBookmark,
  showOnlyBookmarks,
  setShowOnlyBookmarks,
  onNavigateToCustomSheet
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | 'all'>(categoryScope ?? 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Deep domain catalog instance
  const activeCatalog = useMemo(() => new CatalogEngine(resources), [resources]);
  const allTopics = useMemo(() => activeCatalog.getTopicTaxonomy(), [activeCatalog]);

  // Query resources
  const filteredResources = useMemo(() => {
    return activeCatalog.queryResources({
      query: searchQuery,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      topic: selectedTopic,
      bookmarkedOnly: showOnlyBookmarks,
      bookmarkedIds
    });
  }, [activeCatalog, searchQuery, selectedCategory, selectedDifficulty, selectedTopic, showOnlyBookmarks, bookmarkedIds]);

  // Interactive tier preview state for CP-31 card
  const [selectedTier, setSelectedTier] = useState<number>(1000);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(categoryScope ?? 'all');
    setSelectedDifficulty('all');
    setSelectedTopic('all');
    setShowOnlyBookmarks(false);
  };

  const hasActiveFilters = searchQuery || (categoryScope ? false : selectedCategory !== 'all') || selectedDifficulty !== 'all' || selectedTopic !== 'all' || showOnlyBookmarks;

  return (
    <div className="resources-hub" style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem' }}>
      
      {/* 1. Compact Tool Header & Live Ticker (Replaces the bulky marketing hero) */}
      <div className="resources-hub-heading" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-hairline)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            {categoryScope === 'books' ? 'Algorithm Books & Guides' : 'Competitive & Algorithmic Problemsets'}
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {categoryScope === 'books'
              ? 'Reference books and handbooks for algorithms and competitive programming.'
              : 'Curated sheets, rating ladders, and benchmark judges.'}
          </p>
        </div>

        {/* Quick Ticker Chips */}
        {categoryScope !== 'books' && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className="chip chip-cyan">455 Striver Problems</span>
          <span className="chip chip-purple">31 CF Rating Tiers</span>
          <span className="chip chip-emerald">300 CSES Tasks</span>
          <button 
            onClick={onNavigateToCustomSheet}
            className="chip chip-amber"
            style={{ cursor: 'pointer', transition: 'transform var(--trans-fast)' }}
          >
            <Flame size={11} /> 16 Core Sheet Tasks
          </button>
        </div>}
      </div>

      {/* 2. Unified Command Bar (Single-row filter dock) */}
      <div className="resources-filterbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(15, 18, 26, 0.95)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 'var(--radius-md)',
        padding: '0.5rem 0.75rem',
        marginBottom: '1.5rem'
      }}>
        {/* Search input with keyboard hint */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input
            type="text"
            placeholder={categoryScope === 'books' ? 'Search books, authors, topics...' : 'Search problems, sheets, tags...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              borderRadius: '6px',
              color: 'var(--text-main)',
              fontSize: '0.82rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Segmented Control */}
        {!categoryScope && <div className="segmented-control" style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`segmented-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory('sheets')}
            className={`segmented-btn ${selectedCategory === 'sheets' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <FileText size={12} /> Sheets
          </button>
          <button
            onClick={() => setSelectedCategory('contests')}
            className={`segmented-btn ${selectedCategory === 'contests' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <Trophy size={12} /> Contests
          </button>
          <button
            onClick={() => setSelectedCategory('books')}
            className={`segmented-btn ${selectedCategory === 'books' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <BookOpen size={12} /> Books
          </button>
          <button
            onClick={() => setSelectedCategory('channels')}
            className={`segmented-btn ${selectedCategory === 'channels' ? 'active' : ''}`}
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
          >
            <Video size={12} /> Videos
          </button>
        </div>}

        {/* Dropdowns & Layout Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Topics</option>
            {allTopics.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Difficulty Select */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as any)}
            style={{
              padding: '0.45rem 0.65rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-hairline)',
              color: 'var(--text-muted)',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* View Toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-hairline)', borderRadius: '6px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '4px 6px',
                borderRadius: '4px',
                backgroundColor: viewMode === 'grid' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--text-main)' : 'var(--text-subtle)'
              }}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '4px 6px',
                borderRadius: '4px',
                backgroundColor: viewMode === 'list' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: viewMode === 'list' ? 'var(--text-main)' : 'var(--text-subtle)'
              }}
              title="List View"
            >
              <List size={13} />
            </button>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                color: 'var(--rose)',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 3. Modern Bento Grid Playground Layout */}
      {viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '1rem'
        }}>
          {categoryScope !== 'books' && <>
          {/* BENTO 1: Striver A2Z Course (Span 8 cols on desktop) */}
          <div 
            className="bento-card bento-card-featured" 
            style={{
              gridColumn: 'span 8',
              minHeight: '230px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="chip chip-cyan">Primary Interview Sheet</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>455 Problems • Curated by Striver</span>
                </div>
                <button
                  onClick={() => onToggleBookmark('sheet-striver-a2z')}
                  title="Bookmark"
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    backgroundColor: bookmarkedIds.has('sheet-striver-a2z') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: bookmarkedIds.has('sheet-striver-a2z') ? 'var(--amber)' : 'var(--text-subtle)'
                  }}
                >
                  <Bookmark size={15} fill={bookmarkedIds.has('sheet-striver-a2z') ? 'var(--amber)' : 'none'} />
                </button>
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                Striver's A2Z DSA Course & Sheet
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', maxWidth: '640px', marginBottom: '1rem' }}>
                The premier step-by-step roadmap for software engineering interviews. Covers arrays, binary search, recursion, trees, graphs, and dynamic programming with step-by-step video logic.
              </p>

              {/* Interactive topic launcher strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                {['Arrays', 'Binary Search', 'Trees', 'Graphs', 'Dynamic Programming'].map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedTopic(t)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: 'rgba(56, 189, 248, 0.08)',
                      color: 'var(--cyan)',
                      border: '1px solid rgba(56, 189, 248, 0.18)'
                    }}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-hairline)',
              marginTop: '1rem'
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={13} fill="var(--amber)" /> 4.95 Rating • takeuforward.org
              </span>

              <a
                href="https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--text-main)',
                  color: 'var(--bg-canvas)',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <span>Open Striver Sheet</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* BENTO 2: CP-31 Sheet by TLE Eliminators (Span 4 cols) */}
          <div 
            className="bento-card" 
            style={{
              gridColumn: 'span 4',
              minHeight: '230px',
              border: '1px solid rgba(168, 85, 247, 0.22)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span className="chip chip-purple">Codeforces Climb</span>
                <button
                  onClick={() => onToggleBookmark('sheet-cp31')}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    backgroundColor: bookmarkedIds.has('sheet-cp31') ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                    color: bookmarkedIds.has('sheet-cp31') ? 'var(--amber)' : 'var(--text-subtle)'
                  }}
                >
                  <Bookmark size={15} fill={bookmarkedIds.has('sheet-cp31') ? 'var(--amber)' : 'none'} />
                </button>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                CP-31 Sheet
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                Targeted Codeforces problem sets categorized strictly by contest rating brackets.
              </p>

              {/* Interactive Rating Tier Picker */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
                Select Rating Tier: <strong>{selectedTier}</strong>
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                {[800, 900, 1000, 1200, 1400, 1600].map(tier => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      backgroundColor: selectedTier === tier ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedTier === tier ? '#c084fc' : 'var(--text-muted)',
                      border: selectedTier === tier ? '1px solid #a855f7' : '1px solid var(--border-hairline)'
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-hairline)',
              marginTop: '1rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>496 Problems</span>
              <a
                href="https://www.tle-eliminators.com/cp-sheet"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.07)',
                  color: 'var(--text-main)',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                <span>Open CP-31</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          {/* BENTO 3: CSES Problem Set (Span 4 cols) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span className="chip chip-emerald">Gold Standard</span>
                <button
                  onClick={() => onToggleBookmark('sheet-cses-problemset')}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    color: bookmarkedIds.has('sheet-cses-problemset') ? 'var(--amber)' : 'var(--text-subtle)'
                  }}
                >
                  <Bookmark size={15} fill={bookmarkedIds.has('sheet-cses-problemset') ? 'var(--amber)' : 'none'} />
                </button>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.3rem' }}>CSES Problem Set</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
                300 classic benchmark tasks by Antti Laaksonen covering Sorting, DP, Graph Algorithms, Trees, and Range Queries.
              </p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span className="chip chip-muted">300 Tasks</span>
                <span className="chip chip-muted">No Tricks</span>
                <span className="chip chip-muted">Pure DSA</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-hairline)', marginTop: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Univ. of Helsinki</span>
              <a href="https://cses.fi/problemset/" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyan)' }}>
                Solve Tasks &rarr;
              </a>
            </div>
          </div>

          {/* BENTO 5: ACD Ladders & Practice Judges (Span 4 cols) */}
          <div className="bento-card" style={{ gridColumn: 'span 4' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span className="chip chip-muted">Adaptive Ladder</span>
                <button
                  onClick={() => onToggleBookmark('sheet-acd-ladders')}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    color: bookmarkedIds.has('sheet-acd-ladders') ? 'var(--amber)' : 'var(--text-subtle)'
                  }}
                >
                  <Bookmark size={15} fill={bookmarkedIds.has('sheet-acd-ladders') ? 'var(--amber)' : 'none'} />
                </button>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.3rem' }}>ACD Ladders (A2OJ)</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.85rem' }}>
                Auto-updating Codeforces practice ladder. Syncs your handle and pulls unsolved problems at your rating.
              </p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <span className="chip chip-muted">Auto-Sync</span>
                <span className="chip chip-muted">Codeforces</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border-hairline)', marginTop: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>A Code Daily</span>
              <a href="https://acodedaily.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cyan)' }}>
                Open Ladder &rarr;
              </a>
            </div>
          </div>
          </>}

          {/* ALL REMAINING RESOURCES (Compact Bento Cards - Span 4 or 6) */}
          {filteredResources
            .filter(r => !['sheet-striver-a2z', 'sheet-cp31', 'sheet-cses-problemset', 'sheet-acd-ladders'].includes(r.id))
            .map((res) => {
              const isBookmarked = bookmarkedIds.has(res.id);
              return (
                <div 
                  key={res.id} 
                  className="bento-card"
                  style={{ gridColumn: 'span 4' }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="chip chip-muted">{res.category}</span>
                      <button
                        onClick={() => onToggleBookmark(res.id)}
                        style={{
                          padding: '4px',
                          color: isBookmarked ? 'var(--amber)' : 'var(--text-subtle)'
                        }}
                      >
                        <Bookmark size={14} fill={isBookmarked ? 'var(--amber)' : 'none'} />
                      </button>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      {res.title}
                    </h4>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '0.75rem' }}>
                      {res.subtitle || res.description.substring(0, 85) + '...'}
                    </p>

                    {/* Topic Tags */}
                    {res.topicTags && (
                      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                        {res.topicTags.slice(0, 3).map(tag => (
                          <span key={tag} className="chip chip-muted" style={{ fontSize: '0.65rem' }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-hairline)',
                    marginTop: '0.75rem'
                  }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                      {res.difficulty}
                    </span>

                    <a
                      href={res.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-main)'
                      }}
                    >
                      <span>Open</span>
                      <ArrowUpRight size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        /* Compact List / Table View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filteredResources.map((res) => {
            const isBookmarked = bookmarkedIds.has(res.id);
            return (
              <div
                key={res.id}
                className="bento-card"
                style={{
                  padding: '0.85rem 1.25rem',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: '1 1 300px' }}>
                  <button
                    onClick={() => onToggleBookmark(res.id)}
                    style={{
                      padding: '4px',
                      color: isBookmarked ? 'var(--amber)' : 'var(--text-subtle)'
                    }}
                  >
                    <Bookmark size={16} fill={isBookmarked ? 'var(--amber)' : 'none'} />
                  </button>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span className="chip chip-muted" style={{ fontSize: '0.65rem' }}>{res.category}</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{res.title}</span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {res.subtitle || res.description.substring(0, 100) + '...'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{res.difficulty}</span>
                  <a
                    href={res.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: 'var(--text-main)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}
                  >
                    <span>Visit</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
