
import React, { useState, useRef } from 'react';
import { Post, Comment } from '../types';
import { speakText, decodeAudioData } from '../services/geminiService';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onComment(post.id, commentText);
    setCommentText('');
  };

  const handleSpeak = async () => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const audioData = await speakText(post.content);
      if (audioData) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error(error);
      setIsSpeaking(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden mb-6 transition-all hover:shadow-md">
      <div className="p-4 flex items-center gap-3">
        <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50 dark:ring-slate-800" />
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">{post.userName}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs">{post.userHandle} • {post.createdAt}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={handleSpeak}
            disabled={isSpeaking}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSpeaking ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800'}`}
            title="Listen to post"
          >
            <i className={`fa-solid ${isSpeaking ? 'fa-volume-high animate-pulse' : 'fa-volume-low'}`}></i>
          </button>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <i className="fa-solid fa-ellipsis"></i>
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-slate-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {post.image && (
        <div className="w-full bg-slate-100 dark:bg-slate-950 overflow-hidden max-h-[500px] flex items-center justify-center border-y border-slate-100 dark:border-slate-800">
          <img src={post.image} alt="Post" className="w-full object-cover" />
        </div>
      )}

      <div className="p-4 flex items-center gap-6 border-t border-slate-50 dark:border-slate-800">
        <button 
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-2 text-sm transition-colors ${post.isLiked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-500'}`}
        >
          <i className={`${post.isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
          <span className="font-medium">{post.likes}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
        >
          <i className="fa-regular fa-comment"></i>
          <span className="font-medium">{post.comments.length}</span>
        </button>
        <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors">
          <i className="fa-regular fa-paper-plane"></i>
        </button>
        <button className="ml-auto text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors">
          <i className="fa-regular fa-bookmark"></i>
        </button>
      </div>

      {showComments && (
        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 p-4">
          <div className="space-y-4 mb-4">
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{comment.userName}</span>
                    <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
            <button 
              type="submit"
              className="bg-indigo-600 text-white rounded-full p-2 w-8 h-8 flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
              disabled={!commentText.trim()}
            >
              <i className="fa-solid fa-arrow-up text-xs"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
