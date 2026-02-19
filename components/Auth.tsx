
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuthenticate: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API. 
    // Here we simulate success with the provided or default data.
    const mockUser: User = {
      id: Date.now().toString(),
      name: name || 'Explorer',
      username: username ? `@${username.replace('@', '')}` : '@explorer',
      avatar: `https://picsum.photos/seed/${username || 'default'}/200/200`,
      coverImage: 'https://picsum.photos/seed/cover/1200/400',
      bio: 'New member of Sinigang Social. Ready to share, connect, and explore the digital frontier.',
      followers: 0,
      following: 0
    };
    onAuthenticate(mockUser);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 relative overflow-hidden font-sans p-4">
      {/* Animated Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 mx-auto mb-6">
            <i className="fa-solid fa-bolt text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">SINIGANG SOCIAL</h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em]">The AI Social Collective</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
          <div className="flex bg-slate-900/50 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Join Us
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <i className="fa-solid fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sarah Drasner"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <i className="fa-solid fa-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. sdrasner"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="email" 
                  required
                  placeholder="name@sinigang.social"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 mt-4 flex items-center justify-center gap-3"
            >
              {isLogin ? 'Access Collective' : 'Create Identity'}
              <i className="fa-solid fa-arrow-right-long"></i>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs">
              By joining, you agree to the <span className="text-indigo-400 cursor-pointer hover:underline">Neural Protocols</span> and <span className="text-indigo-400 cursor-pointer hover:underline">Data Ethics</span>.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">
          Powered by Gemini Intelligence
        </p>
      </div>
    </div>
  );
};

export default Auth;
