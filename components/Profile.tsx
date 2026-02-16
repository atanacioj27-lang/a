
import React, { useState } from 'react';
import { User, Post } from '../types';
import PostCard from './PostCard';
import { generateUserBio } from '../services/geminiService';

interface ProfileProps {
  user: User;
  posts: Post[];
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, posts, onLike, onComment }) => {
  const [activeTab, setActiveTab] = useState<'POSTS' | 'LIKES' | 'MEDIA'>('POSTS');
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    const interests = prompt("Tell AI about your interests to generate a bio:");
    if (interests) {
      const newBio = await generateUserBio(interests);
      setBioInput(newBio);
    }
    setIsGeneratingBio(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden mb-6 shadow-sm transition-colors duration-300">
        <div className="h-48 w-full bg-indigo-100 dark:bg-slate-800 relative">
          <img src={user.coverImage} alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 dark:from-black/40 to-transparent"></div>
        </div>
        
        <div className="px-6 pb-6 relative">
          <div className="flex justify-between items-end -mt-12 mb-4">
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-lg ring-1 ring-slate-100 dark:ring-slate-800" 
            />
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-6 py-2 rounded-full text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isEditing ? 'Save Profile' : 'Edit Profile'}
            </button>
          </div>

          <div className="space-y-1 mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{user.username}</p>
          </div>

          {isEditing ? (
            <div className="mb-4 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">Biography</label>
                <button 
                  onClick={handleGenerateBio}
                  disabled={isGeneratingBio}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
                >
                  <i className={`fa-solid fa-wand-sparkles ${isGeneratingBio ? 'animate-pulse' : ''}`}></i>
                  {isGeneratingBio ? 'AI Writing...' : 'AI Bio Generation'}
                </button>
              </div>
              <textarea 
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
              />
            </div>
          ) : (
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">{user.bio}</p>
          )}

          <div className="flex gap-8 border-t border-slate-50 dark:border-slate-800 pt-6">
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.followers}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{user.following}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Following</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{posts.length}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Posts</p>
            </div>
          </div>
        </div>

        <div className="flex border-t border-slate-100 dark:border-slate-800">
          {(['POSTS', 'MEDIA', 'LIKES'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
                activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'POSTS' && posts.map(post => (
          <PostCard key={post.id} post={post} onLike={onLike} onComment={onComment} />
        ))}
        {activeTab === 'POSTS' && posts.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <i className="fa-regular fa-image text-slate-200 dark:text-slate-800 text-5xl mb-4"></i>
            <p className="text-slate-500 dark:text-slate-600 text-sm">No posts yet. Share your first thought!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
