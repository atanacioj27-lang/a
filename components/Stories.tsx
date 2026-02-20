import React from 'react';

interface Story {
  id: string;
  name: string;
  avatar: string;
  isLive?: boolean;
}

interface StoriesProps {
  stories: Story[];
}

const Stories: React.FC<StoriesProps> = ({ stories }) => (
  <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-5 shadow-sm mb-6">
    <div className="flex items-center justify-between mb-4 px-1">
      <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Stories</h2>
      <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">See all</button>
    </div>
    <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-1">
      {stories.map((story) => (
        <button key={story.id} className="text-center shrink-0 group">
          <div className="relative p-[2px] rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500">
            <img
              src={story.avatar}
              alt={story.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-900"
            />
            {story.isLive && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full border border-white dark:border-slate-900">
                LIVE
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-500 max-w-16 truncate">
            {story.name}
          </p>
        </button>
      ))}
    </div>
  </section>
);

export default Stories;
