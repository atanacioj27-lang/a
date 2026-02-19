
import React, { useState, useEffect, useMemo } from 'react';
import { Post, User, ViewMode, Comment, Notification } from './types';
import PostCard from './components/PostCard';
import CreatePost from './components/CreatePost';
import Stories from './components/Stories';
import Profile from './components/Profile';
import Auth from './components/Auth';
import AiAssistant from './components/AiAssistant';
import { searchGrounding, generateSearchThumbnails } from './services/geminiService';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [view, setView] = useState<ViewMode>(ViewMode.FEED);
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{ text: string; links: any[]; images: string[] } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set(['2', '4']));
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Initial Posts
    const initialPosts: Post[] = [
      {
        id: '101',
        userId: '2',
        userName: 'Sinigang AI',
        userHandle: '@sinigang_ai',
        userAvatar: 'https://picsum.photos/seed/ai/200/200',
        content: "Welcome to Sinigang! The first social platform powered by Gemini. Experience true creativity with our AI generation tools. 🚀 #SinigangSocial #Future",
        image: 'https://picsum.photos/seed/tech/800/600',
        likes: 242,
        comments: [
          { id: 'c1', userId: '3', userName: 'John Doe', userAvatar: 'https://picsum.photos/seed/john/100/100', text: "This looks amazing!", createdAt: "2h ago" }
        ],
        createdAt: '1h ago',
        isLiked: false
      },
      {
        id: '102',
        userId: '4',
        userName: 'Liam Wright',
        userHandle: '@liamw',
        userAvatar: 'https://picsum.photos/seed/liam/200/200',
        content: "Just finished hiking the Dolomites. The views are absolutely breathtaking. Nature is the best designer. 🏔️",
        image: 'https://picsum.photos/seed/mountain/800/600',
        likes: 156,
        comments: [],
        createdAt: '4h ago',
        isLiked: true
      }
    ];
    setPosts(initialPosts);

    // Initial Notifications
    setNotifications([
      { id: 'n1', type: 'LIKE', user: { name: 'Sinigang AI', avatar: 'https://picsum.photos/seed/ai/200/200' }, content: 'liked your post about coding.', timestamp: '10m ago', isRead: false },
      { id: 'n2', type: 'FOLLOW', user: { name: 'Elena Rossi', avatar: 'https://picsum.photos/seed/a2/50/50' }, content: 'started following you.', timestamp: '2h ago', isRead: true },
      { id: 'n3', type: 'MENTION', user: { name: 'Marcus Chen', avatar: 'https://picsum.photos/seed/a1/50/50' }, content: 'mentioned you in a post: "Check out the new project!"', timestamp: '5h ago', isRead: true },
    ]);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('isAuth', 'true');
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('isAuth');
    localStorage.removeItem('user');
  };

  const handleCreatePost = (content: string, image?: string) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userHandle: currentUser.username,
      userAvatar: currentUser.avatar,
      content,
      image,
      likes: 0,
      comments: [],
      createdAt: 'Just now',
      isLiked: false
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      createdAt: 'Just now'
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const [groundingResult, thumbnailImages] = await Promise.all([
        searchGrounding(searchQuery),
        generateSearchThumbnails(searchQuery)
      ]);

      if (groundingResult) {
        setSearchResult({
          ...groundingResult,
          images: thumbnailImages
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFollow = (id: string) => {
    setFollowingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (currentUser) {
          const updated = { ...currentUser, following: currentUser.following - 1 };
          setCurrentUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        }
      } else {
        next.add(id);
        if (currentUser) {
          const updated = { ...currentUser, following: currentUser.following + 1 };
          setCurrentUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        }
      }
      return next;
    });
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  const stories = useMemo(() => [
    { id: 's1', name: 'You', avatar: currentUser?.avatar || 'https://picsum.photos/seed/you/100/100' },
    { id: 's2', name: 'Sinigang AI', avatar: 'https://picsum.photos/seed/ai-story/100/100', isLive: true },
    { id: 's3', name: 'Marcus', avatar: 'https://picsum.photos/seed/marcus-story/100/100' },
    { id: 's4', name: 'Elena', avatar: 'https://picsum.photos/seed/elena-story/100/100' },
    { id: 's5', name: 'Liam', avatar: 'https://picsum.photos/seed/liam-story/100/100' },
  ], [currentUser?.avatar]);

  if (!isAuthenticated || !currentUser) {
    return <Auth onAuthenticate={handleAuthSuccess} />;
  }

  const renderContent = () => {
    switch (view) {
      case ViewMode.FEED:
        return (
          <div className="max-w-xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Stories stories={stories} />
            <CreatePost userAvatar={currentUser.avatar} onPostCreated={handleCreatePost} />
            <div className="space-y-6">
              {posts.map(post => (
                <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
              ))}
            </div>
          </div>
        );
      case ViewMode.PROFILE:
        return (
          <div className="max-w-3xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Profile 
              user={currentUser} 
              posts={posts.filter(p => p.userId === currentUser.id)} 
              onLike={handleLike} 
              onComment={handleComment} 
            />
          </div>
        );
      case ViewMode.NOTIFICATIONS:
        return (
          <div className="max-w-2xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-6 border-b border-slate-100 dark:border-slate-800 flex items-start gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!notif.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    notif.type === 'LIKE' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' :
                    notif.type === 'FOLLOW' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
                  }`}>
                    <i className={`fa-solid ${
                      notif.type === 'LIKE' ? 'fa-heart' :
                      notif.type === 'FOLLOW' ? 'fa-user-plus' :
                      'fa-at'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        {notif.user && (
                          <img src={notif.user.avatar} className="w-6 h-6 rounded-full" alt="" />
                        )}
                        <span className="text-sm font-bold">{notif.user?.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">{notif.timestamp}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{notif.content}</p>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <i className="fa-regular fa-bell text-4xl mb-4"></i>
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          </div>
        );
      case ViewMode.EXPLORE:
        return (
          <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100 mb-2 tracking-tighter">Discover Sinigang</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">Search the world with real-time AI and visual previews.</p>
              <div className="relative group max-w-2xl mx-auto">
                <input 
                  type="text" 
                  placeholder="Ask Sinigang AI for real-time news or trends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-5 pr-32 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-xl transition-all outline-none text-lg"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-8 rounded-xl text-sm font-black hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
                >
                  {isSearching ? <><i className="fa-solid fa-spinner animate-spin"></i> Reasoning...</> : <><i className="fa-solid fa-magnifying-glass"></i> Search</>}
                </button>
              </div>

              {isSearching && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Generating Visual Previews & Fetching Insights</p>
                </div>
              )}

              {searchResult && (
                <div className="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden text-left">
                  {searchResult.images.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-2">
                      {searchResult.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square group rounded-3xl overflow-hidden shadow-lg border-2 border-white dark:border-slate-800 hover:scale-[1.02] transition-transform">
                          <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white text-[10px] font-black uppercase tracking-widest bg-indigo-600/80 px-3 py-1.5 rounded-full border border-white/20">AI Visual</span>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-xl text-[8px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              CONCEPT PREVIEW #{idx + 1}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800">
                        <i className="fa-solid fa-sparkles text-indigo-600 dark:text-indigo-400"></i>
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-slate-100 leading-tight">Sinigang Synthesis</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Grounded Real-time Analysis</p>
                      </div>
                    </div>
                    
                    <div className="prose dark:prose-invert max-w-none">
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-8 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 italic">
                        "{searchResult.text}"
                      </p>
                    </div>
                    
                    {searchResult.links.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-[2px] w-4 bg-indigo-500 rounded-full"></div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Sources</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchResult.links.map((link, i) => (
                            <a 
                              key={i} 
                              href={link.uri} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[11px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 font-bold hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[9px] text-indigo-500"></i>
                              {link.title || 'Source Insight'}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between h-[450px] shadow-2xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/30">
                    <i className="fa-solid fa-fire-flame-curved text-xl"></i>
                  </div>
                  <h2 className="text-5xl font-black mb-6 tracking-tighter leading-tight">Infinite <br/> Exploration</h2>
                  <p className="text-indigo-100 max-w-sm text-lg leading-relaxed">Experience the collective consciousness of creators worldwide, synthesized by next-gen Gemini intelligence.</p>
                </div>
                <div className="flex gap-4 relative z-10">
                  <button className="bg-white text-indigo-600 font-black py-4 px-8 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl active:scale-95">Global Feed</button>
                  <button className="bg-white/20 backdrop-blur-md border border-white/30 text-white font-black py-4 px-8 rounded-2xl hover:bg-white/30 transition-all active:scale-95">Creator Labs</button>
                </div>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 h-[450px] flex flex-col justify-between shadow-sm relative overflow-hidden">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">AI Hall of Fame</h2>
                    <i className="fa-solid fa-trophy text-amber-500"></i>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Today's most shared generative breakthroughs.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-square border-2 border-slate-50 dark:border-slate-800 shadow-sm">
                        <img src={`https://picsum.photos/seed/art${i}/200/200`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
                        <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/20 transition-all"></div>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs uppercase tracking-widest">
                  View Leaderboard
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="text-center py-20 text-slate-400 dark:text-slate-600">Coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row relative text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden">
      {/* Sidebar */}
      <nav className="w-full md:w-24 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 md:h-screen flex md:flex-col items-center lg:items-start p-4 md:p-6 z-40 transition-colors duration-300">
        <div className="hidden md:flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => setView(ViewMode.FEED)}>
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-110">
            <i className="fa-solid fa-bolt text-white text-xl"></i>
          </div>
          <span className="hidden lg:block text-2xl font-black text-indigo-900 dark:text-indigo-100 tracking-tighter">SINIGANG</span>
        </div>

        <div className="flex-1 flex md:flex-col items-center lg:items-stretch justify-around w-full gap-2">
          <NavItem icon="fa-house" label="Home" active={view === ViewMode.FEED} onClick={() => setView(ViewMode.FEED)} />
          <NavItem icon="fa-compass" label="Explore" active={view === ViewMode.EXPLORE} onClick={() => setView(ViewMode.EXPLORE)} />
          <NavItem 
            icon="fa-bell" 
            label="Alerts" 
            active={view === ViewMode.NOTIFICATIONS} 
            onClick={() => setView(ViewMode.NOTIFICATIONS)} 
            badge={unreadCount > 0 ? unreadCount : undefined}
          />
          <NavItem icon="fa-user" label="Profile" active={view === ViewMode.PROFILE} onClick={() => setView(ViewMode.PROFILE)} />
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-4 py-4 px-4 rounded-2xl transition-all group text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className={`fa-solid ${isDarkMode ? 'fa-sun text-amber-400' : 'fa-moon'} text-xl transition-transform group-hover:rotate-45`}></i>
            </div>
            <span className="hidden lg:block text-sm font-medium">{isDarkMode ? 'Solar Mode' : 'Lunar Mode'}</span>
          </button>
        </div>

        <div className="hidden md:flex flex-col gap-2 mt-auto w-full">
          <div className="flex items-center gap-3 p-2 lg:bg-slate-50 dark:lg:bg-slate-800/50 lg:rounded-2xl lg:w-full border border-transparent dark:lg:border-slate-800">
            <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-900" />
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate w-32">{currentUser.name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{currentUser.username}</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="flex items-center gap-4 py-3 px-4 rounded-xl transition-all group text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="fa-solid fa-right-from-bracket"></i>
            </div>
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-8 custom-scrollbar overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="hidden xl:block w-80 p-8 border-l border-slate-200 dark:border-slate-800 sticky top-0 h-screen overflow-y-auto custom-scrollbar">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-8 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center justify-between text-sm uppercase tracking-wider">
            Trending Tags
            <i className="fa-solid fa-arrow-trend-up text-indigo-500"></i>
          </h3>
          <ul className="space-y-6">
            <TrendingItem tag="#Web3World" posts="124k" />
            <TrendingItem tag="#DigitalRenaissance" posts="98k" />
            <TrendingItem tag="#GenerativeArt" posts="82k" />
            <TrendingItem tag="#SinigangSocial" posts="45k" />
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center justify-between text-sm uppercase tracking-wider">
            Who to Follow
          </h3>
          <ul className="space-y-6">
            <FollowItem 
              id="f1" 
              name="Marcus Chen" 
              handle="@mchen_art" 
              avatar="https://picsum.photos/seed/a1/50/50" 
              isFollowing={followingIds.has('f1')} 
              onToggle={() => toggleFollow('f1')}
            />
            <FollowItem 
              id="f2" 
              name="Elena Rossi" 
              handle="@elena_codes" 
              avatar="https://picsum.photos/seed/a2/50/50" 
              isFollowing={followingIds.has('f2')} 
              onToggle={() => toggleFollow('f2')}
            />
            <FollowItem 
              id="f3" 
              name="Tech Prophet" 
              handle="@prophet_ai" 
              avatar="https://picsum.photos/seed/a3/50/50" 
              isFollowing={followingIds.has('f3')} 
              onToggle={() => toggleFollow('f3')}
            />
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mt-8">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center justify-between text-sm uppercase tracking-wider">
            Messages
            <i className="fa-regular fa-paper-plane text-indigo-500"></i>
          </h3>
          <ul className="space-y-4">
            <MessageItem name="Sinigang AI" handle="@sinigang_ai" lastMessage="I can help draft your next post!" time="2m" unread />
            <MessageItem name="Elena Rossi" handle="@elena_codes" lastMessage="Would love your feedback on my portfolio redesign." time="1h" />
            <MessageItem name="Marcus Chen" handle="@mchen_art" lastMessage="Collab on an AI art challenge this weekend?" time="4h" />
          </ul>
        </div>
        
        <div className="mt-8 px-6 text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest flex flex-wrap gap-4">
          <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
          <a href="#" className="hover:text-indigo-500 transition-colors">Cookies</a>
          <span>© 2025 Sinigang Social</span>
        </div>
      </aside>

      {/* Floating AI Assistant */}
      <AiAssistant />
    </div>
  );
};

const NavItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void; badge?: number }> = ({ icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 py-4 px-4 rounded-2xl transition-all group relative ${
      active ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
    }`}
  >
    <div className="w-6 h-6 flex items-center justify-center relative">
      <i className={`fa-solid ${icon} text-xl transition-transform group-hover:scale-110`}></i>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
          {badge}
        </span>
      )}
    </div>
    <span className="hidden lg:block text-sm">{label}</span>
  </button>
);

const TrendingItem: React.FC<{ tag: string; posts: string }> = ({ tag, posts }) => (
  <li className="group cursor-pointer">
    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{tag}</p>
    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{posts} Posts</p>
  </li>
);

const FollowItem: React.FC<{ id: string; name: string; handle: string; avatar: string; isFollowing: boolean; onToggle: () => void }> = ({ name, handle, avatar, isFollowing, onToggle }) => (
  <li className="flex items-center gap-3">
    <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800" />
    <div className="flex-1 overflow-hidden text-left">
      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{name}</p>
      <p className="text-[10px] text-slate-400 truncate">{handle}</p>
    </div>
    <button 
      onClick={onToggle}
      className={`text-[10px] font-bold px-4 py-2 rounded-full transition-all border ${
        isFollowing 
          ? 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-rose-500 hover:text-rose-500' 
          : 'bg-slate-900 dark:bg-indigo-600 text-white border-transparent hover:bg-indigo-600 dark:hover:bg-indigo-500'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  </li>
);

const MessageItem: React.FC<{ name: string; handle: string; lastMessage: string; time: string; unread?: boolean }> = ({ name, handle, lastMessage, time, unread }) => (
  <li className="border border-slate-100 dark:border-slate-800 rounded-2xl p-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer">
    <div className="flex items-start justify-between gap-3 mb-1">
      <div>
        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{name}</p>
        <p className="text-[10px] text-slate-400">{handle}</p>
      </div>
      <span className="text-[10px] font-bold text-slate-400">{time}</span>
    </div>
    <div className="flex items-center justify-between gap-2">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{lastMessage}</p>
      {unread && <span className="w-2 h-2 rounded-full bg-indigo-500"></span>}
    </div>
  </li>
);

export default App;
