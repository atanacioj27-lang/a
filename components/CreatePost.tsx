
import React, { useState } from 'react';
import { generatePostContent, generatePostImage } from '../services/geminiService';

interface CreatePostProps {
  userAvatar: string;
  onPostCreated: (content: string, image?: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ userAvatar, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  const handlePost = () => {
    if (!content.trim() && !image) return;
    setIsPosting(true);
    // Simulate slight delay
    setTimeout(() => {
      onPostCreated(content, image || undefined);
      setContent('');
      setImage(null);
      setIsPosting(false);
    }, 500);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setShowAiMenu(false);
    
    try {
      const generatedText = await generatePostContent(aiPrompt);
      setContent(generatedText);
      const generatedImage = await generatePostImage(aiPrompt);
      if (generatedImage) setImage(generatedImage);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm relative overflow-hidden transition-colors duration-300">
      {isGenerating && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Sinigang AI is crafting your masterpiece...</p>
        </div>
      )}

      <div className="flex gap-4 mb-4">
        <img src={userAvatar} alt="User" className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50 dark:ring-slate-800" />
        <textarea 
          placeholder="What's on your mind?"
          className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 resize-none min-h-[80px] py-2 text-sm outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {image && (
        <div className="relative mb-4 group">
          <img src={image} alt="Upload preview" className="w-full rounded-xl object-cover max-h-[300px] border border-slate-100 dark:border-slate-800" />
          <button 
            onClick={() => setImage(null)}
            className="absolute top-2 right-2 bg-slate-900/50 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-900/80 transition-colors"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-3">
        <div className="flex items-center gap-2">
          <label className="w-10 h-10 flex items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <i className="fa-regular fa-image"></i>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (re) => setImage(re.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>
          <button 
            onClick={() => setShowAiMenu(!showAiMenu)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${showAiMenu ? 'bg-indigo-600 text-white' : 'text-purple-500 hover:bg-purple-50 dark:hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-wand-sparkles"></i>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-green-500 hover:bg-green-50 dark:hover:bg-slate-800 transition-colors">
            <i className="fa-regular fa-face-smile"></i>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors">
            <i className="fa-solid fa-location-dot"></i>
          </button>
        </div>

        <button 
          onClick={handlePost}
          disabled={(!content.trim() && !image) || isPosting}
          className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-full text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md shadow-indigo-200 dark:shadow-none"
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>

      {showAiMenu && (
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
          <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-400 mb-2 flex items-center gap-2">
            <i className="fa-solid fa-sparkles"></i> AI POST ASSISTANT
          </h4>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="What should the post be about?"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            />
            <button 
              onClick={handleAiGenerate}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Generate
            </button>
          </div>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-400/70 mt-2">
            Tip: Try "A coffee shop in Paris" or "Future of technology".
          </p>
        </div>
      )}
    </div>
  );
};

export default CreatePost;
