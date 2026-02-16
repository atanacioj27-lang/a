
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeAudioData } from '../services/geminiService';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const toggleAssistant = () => {
    if (isOpen && isActive) {
      stopSession();
    }
    setIsOpen(!isOpen);
  };

  const startSession = async () => {
    setStatus('connecting');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus('listening');
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { data: base64, mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              setStatus('speaking');
              const bytes = new Uint8Array(atob(base64Audio).split('').map(c => c.charCodeAt(0)));
              const ctx = audioContextRef.current!;
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(bytes, ctx, 24000, 1);
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              };
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: () => stopSession(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are Aether AI, the helpful assistant for this social media app. You can help users find content, summarize their feed, or just chat about trending topics.',
        }
      });
      
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      stopSession();
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus('idle');
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <>
      <button 
        onClick={toggleAssistant}
        className="fixed bottom-6 right-6 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all transform hover:scale-110 active:scale-95 z-50 group"
      >
        <div className="absolute inset-0 bg-indigo-400 rounded-2xl animate-ping opacity-20 group-hover:opacity-40"></div>
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'} text-2xl relative`}></i>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-4 transition-colors duration-300">
          <div className="bg-indigo-600 p-6 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
              <i className={`fa-solid fa-bolt text-2xl ${isActive ? 'animate-pulse' : ''}`}></i>
            </div>
            <h3 className="text-xl font-bold">Aether Assistant</h3>
            <p className="text-indigo-100 text-xs mt-1">Real-time Voice Intelligence</p>
          </div>

          <div className="p-8 text-center bg-white dark:bg-slate-900 transition-colors duration-300">
            {!isActive ? (
              <>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Start a voice conversation to explore Aether with AI assistance.</p>
                <button 
                  onClick={startSession}
                  disabled={status === 'connecting'}
                  className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-2xl hover:bg-indigo-700 transition-colors w-full shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  {status === 'connecting' ? 'Connecting...' : 'Connect Voice'}
                </button>
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center gap-1 h-8 items-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div 
                      key={i} 
                      className={`w-1 bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-300 ${status === 'speaking' ? 'animate-bounce' : 'h-2'}`}
                      style={{ height: status === 'speaking' ? `${Math.random() * 24 + 8}px` : '8px', animationDelay: `${i * 0.1}s` }}
                    ></div>
                  ))}
                </div>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest animate-pulse">
                  {status === 'listening' ? 'Listening...' : 'Aether is speaking'}
                </p>
                <button 
                  onClick={stopSession}
                  className="border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold py-3 px-8 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full"
                >
                  End Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
