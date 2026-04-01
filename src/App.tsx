/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Music, Play, AlertCircle } from 'lucide-react';

// --- Configuration Data ---

const TELEGRAM_BOT_TOKEN = "8729830281:AAH_YJv_sKm0Ra5ZXtmEo6fZ9QeD__bDs3Q";
const TELEGRAM_CHAT_ID = "6673030747";

const LYRICS_DATA = [
  { time: 0, duration: 8.71, text: "Hey... wait a second. Stop scrolling. I have something to tell you.", gif: "https://raw.githubusercontent.com/as-live001/live/main/hehe-shy.webp" },
  { time: 8.71, duration: 5.02, text: "I don’t know how to explain this perfectly… but I’ll try.", gif: "https://raw.githubusercontent.com/as-live001/live/main/vergonha-beijos.webp" },
  { time: 13.73, duration: 7.64, text: "We haven’t known each other for long. It’s such a short time, yet I don’t know how you started meaning this much to me…", gif: "https://raw.githubusercontent.com/as-live001/live/main/uhmm.webp" },
  { time: 21.37, duration: 9.59, text: "And I understand this might not even exist from your side. Yet somehow, you’ve become important to me in a way I didn’t expect.", gif: "https://raw.githubusercontent.com/as-live001/live/main/bubu-dudu-sseeyall.webp" },
  { time: 30.96, duration: 7.88, text: "It’s strange… how someone new can feel so familiar, like I’ve known you somewhere before.", gif: "https://raw.githubusercontent.com/as-live001/live/main/mochi-peach.webp" },
  { time: 38.84, duration: 10.65, text: "I didn’t plan to feel this way. It just happened quietly, in small moments… in the way you talk, the way you exist.", gif: "https://raw.githubusercontent.com/as-live001/live/main/sad-bunny.webp" },
  { time: 49.49, duration: 8.18, text: "In the way you stay on my mind without even trying. You didn’t do anything special, yet you became someone special to me.", gif: "https://raw.githubusercontent.com/as-live001/live/main/bubu-dudu-bubu-dudu-shy.webp" },
  { time: 57.67, duration: 12.94, text: "Maybe it’s too soon, maybe it doesn’t make sense… but my feelings didn’t wait for the “right time.” They just grew, without asking me.", gif: "https://raw.githubusercontent.com/as-live001/live/main/ami-fat-cat-teary-eyed.webp" },
  { time: 70.61, duration: 7.42, text: "I’m not saying all this to rush you, or to make things complicated. I just didn’t want to hide what I feel anymore.", gif: "https://raw.githubusercontent.com/as-live001/live/main/duck-yellow.webp" },
  { time: 78.03, duration: 4.34, text: "Because honestly… you matter to me now.", gif: "https://raw.githubusercontent.com/as-live001/live/main/cry-crying.webp" },
  { time: 82.37, duration: 9.52, text: "And I don’t know where this could go, but I know I’d like to know you more, spend more time with you, and see if this feeling can become something real.", gif: "https://raw.githubusercontent.com/as-live001/live/main/tkthao219-peach.webp" },
  { time: 91.89, duration: 16.11, text: "So yeah… this is me being honest. I like you. 🤍", gif: "https://raw.githubusercontent.com/as-live001/live/main/rabbit-lovely.webp" }
];

const ROMANTIC_MUSIC_URL = "https://github.com/as-live001/live/raw/main/20260401_130153.mp3.mp3";
const PRANK_MUSIC_URL = "https://github.com/as-live001/live/raw/main/djartmusic-itx27s-a-foolx27s-day-humorous-funny-orchestral-comical-317236.mp3";

type Screen = 'START' | 'NAMES' | 'LYRICS' | 'DECISION' | 'SUCCESS' | 'PRANK';

const WordByWordFade = ({ text, duration }: { text: string; duration: number }) => {
  const words = text.split(" ");
  const totalWords = words.length;
  // Spread the fade-in over 60% of the duration
  const stagger = (duration * 0.6) / totalWords;

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 px-4">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.8,
            delay: i * stagger,
            ease: "easeOut"
          }}
          className="inline-block font-script text-xl md:text-5xl text-white drop-shadow-lg"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('START');
  const [viewerName, setViewerName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [hearts, setHearts] = useState<{ id: number; left: string; size: number; duration: number }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prankAudioRef = useRef<HTMLAudioElement | null>(null);

  // Floating hearts generator
  useEffect(() => {
    // Extract Sender Name from URL
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('from');
    if (fromParam) setSenderName(fromParam);

    const interval = setInterval(() => {
      setHearts(prev => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          left: `${Math.random() * 100}%`,
          size: Math.random() * 20 + 10,
          duration: Math.random() * 3 + 4
        }
      ]);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // Lyrics sync logic
  useEffect(() => {
    if (screen === 'LYRICS' && audioRef.current) {
      const audio = audioRef.current;
      const updateLyrics = () => {
        const currentTime = audio.currentTime;
        
        // Transition to decision screen if audio ends or last lyric finishes
        const lastLyric = LYRICS_DATA[LYRICS_DATA.length - 1];
        if (currentTime >= lastLyric.time + lastLyric.duration - 0.5) {
          setScreen('DECISION');
          return;
        }

        let index = -1;
        for (let i = LYRICS_DATA.length - 1; i >= 0; i--) {
          if (currentTime >= LYRICS_DATA[i].time) {
            index = i;
            break;
          }
        }
        if (index !== -1 && index !== currentLyricIndex) {
          setCurrentLyricIndex(index);
        }
      };

      const handleAudioEnd = () => {
        setScreen('DECISION');
      };

      audio.addEventListener('timeupdate', updateLyrics);
      audio.addEventListener('ended', handleAudioEnd);
      
      return () => {
        audio.removeEventListener('timeupdate', updateLyrics);
        audio.removeEventListener('ended', handleAudioEnd);
      };
    }
  }, [screen, currentLyricIndex]);

  const startExperience = () => {
    setScreen('NAMES');
  };

  const handleNamesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewerName.trim() || !senderName.trim()) return;
    
    setScreen('LYRICS');
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play failed:", e));
    }
  };

  const sendTelegramMessage = async (message: string) => {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
      });
    } catch (error) {
      console.error("Telegram notification failed:", error);
    }
  };

  const handleDecision = (choice: 'YES' | 'NO') => {
    const responseText = choice === 'YES' ? "YES ❤️" : "NO 💔";
    const emoji = choice === 'YES' ? "💖" : "💔";
    
    const vName = viewerName.trim() || "Unknown";
    const sName = senderName.trim() || "Someone";
    const message = `${emoji} New Response!\n\n👤 Viewer: ${vName}\n📩 From: ${sName}\n👉 Response: ${responseText}`;
    
    sendTelegramMessage(message);

    if (choice === 'YES') {
      setScreen('SUCCESS');
    } else {
      setScreen('PRANK');
      if (audioRef.current) audioRef.current.pause();
      if (prankAudioRef.current) {
        prankAudioRef.current.loop = true;
        prankAudioRef.current.play().catch(e => console.error("Prank audio failed:", e));
      }
    }
  };

  const currentGif = () => {
    switch (screen) {
      case 'START': return "https://raw.githubusercontent.com/as-live001/live/main/hehe-shy.webp";
      case 'LYRICS': return LYRICS_DATA[currentLyricIndex].gif;
      case 'DECISION': return "https://raw.githubusercontent.com/as-live001/live/main/what-confused.gif";
      case 'SUCCESS': return "https://media.tenor.com/30-YAHDySRIAAAAm/i-need-you.webp";
      case 'PRANK': return "https://raw.githubusercontent.com/as-live001/live/main/something-something.webp";
      default: return "";
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center overflow-hidden bg-romantic-bg">
      {/* Background Hearts */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{
            left: heart.left,
            fontSize: `${heart.size}px`,
            animationDuration: `${heart.duration}s`
          }}
        >
          <Heart fill="currentColor" />
        </div>
      ))}

      {/* Audio Elements */}
      <audio ref={audioRef} src={ROMANTIC_MUSIC_URL} />
      <audio ref={prankAudioRef} src={PRANK_MUSIC_URL} />

      {/* Content Area */}
      <div className="max-w-4xl z-10 w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {screen === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="gif-container">
                <img src={currentGif()} alt="Reaction" referrerPolicy="no-referrer" />
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-black text-glow tracking-tight">
                A Message For You
              </h1>
              <button onClick={startExperience} className="btn-romantic flex items-center gap-2 mx-auto text-lg">
                Click to Continue <Play size={20} />
              </button>
            </motion.div>
          )}

          {screen === 'NAMES' && (
            <motion.div
              key="names"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4"
            >
              <div className="gif-container !w-[180px] !h-[180px]">
                <img src="https://raw.githubusercontent.com/as-live001/live/main/vergonha-beijos.webp" alt="Shy Reaction" referrerPolicy="no-referrer" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-glow text-white mb-2">
                Before we begin...
              </h2>

              <form onSubmit={handleNamesSubmit} className="w-full flex flex-col gap-4">
                <div className="flex flex-col items-start gap-2 w-full">
                  <label className="text-romantic-accent text-sm font-semibold uppercase tracking-wider ml-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={viewerName}
                    onChange={(e) => setViewerName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-romantic-accent/50 transition-all font-script text-2xl"
                  />
                </div>

                <div className="flex flex-col items-start gap-2 w-full">
                  <label className="text-romantic-accent text-sm font-semibold uppercase tracking-wider ml-1">
                    Who sent this to you?
                  </label>
                  <input
                    type="text"
                    required
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter their name..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-white/20 focus:outline-none focus:border-romantic-accent/50 transition-all font-script text-2xl"
                  />
                </div>

                <button 
                  type="submit"
                  className="btn-romantic mt-4 w-full text-xl py-4 flex items-center justify-center gap-2"
                >
                  Open Message <Heart size={20} fill="currentColor" />
                </button>
              </form>
            </motion.div>
          )}

          {screen === 'LYRICS' && (
            <motion.div
              key={`lyric-${currentLyricIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center gap-8 w-full"
            >
              <div className="gif-container">
                <img 
                  src={LYRICS_DATA[currentLyricIndex].gif} 
                  alt="Lyric Reaction" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <div className="min-h-[120px] flex items-center justify-center">
                <WordByWordFade 
                  text={LYRICS_DATA[currentLyricIndex].text} 
                  duration={LYRICS_DATA[currentLyricIndex].duration} 
                />
              </div>
              <div className="flex items-center justify-center gap-2 text-romantic-accent animate-pulse">
                <Music size={20} />
                <span className="text-sm uppercase tracking-widest font-semibold">Listening...</span>
              </div>
            </motion.div>
          )}

          {screen === 'DECISION' && (
            <motion.div
              key="decision"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              <div className="gif-container !w-[220px] !h-[220px] md:!w-[300px] md:!h-[300px]">
                <img src={currentGif()} alt="Decision Reaction" referrerPolicy="no-referrer" />
              </div>
              <div className="min-h-[100px] flex items-center justify-center">
                <WordByWordFade 
                  text="And if there’s even a small chance that you feel something too… I’d really like to give this a chance. Will you?" 
                  duration={5} 
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 relative z-50 mt-4">
                <button 
                  onClick={() => {
                    console.log("YES clicked");
                    handleDecision('YES');
                  }}
                  className="btn-romantic w-full sm:w-auto text-lg px-10 cursor-pointer py-3"
                >
                  YES, I DO ❤️
                </button>
                <button 
                  onClick={() => {
                    console.log("NO clicked");
                    handleDecision('NO');
                  }}
                  className="btn-no w-full sm:w-auto text-lg px-10 cursor-pointer py-3"
                >
                  NO...
                </button>
              </div>
            </motion.div>
          )}

          {screen === 'SUCCESS' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="gif-container !mb-0">
                <img src={currentGif()} alt="Success Reaction" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          )}

          {screen === 'PRANK' && (
            <motion.div
              key="prank"
              initial={{ opacity: 0, rotate: -5 }}
              animate={{ opacity: 1, rotate: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="gif-container">
                <img src={currentGif()} alt="Prank Reaction" referrerPolicy="no-referrer" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-yellow-400 drop-shadow-2xl uppercase italic tracking-tighter px-4">
                Okay okay… April Fool 😅
              </h2>
              <p className="text-2xl font-serif text-white/80 italic">(but feelings were real though…)</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 text-white/10 font-mono text-[10px] tracking-widest pointer-events-none z-50 select-none">
        {"{ ~as}"}
      </div>
    </div>
  );
}
