import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Compass, 
  ChevronRight, 
  MessageSquare,
  Sparkles,
  Info,
  Radio,
  Clock,
  UserCheck
} from "lucide-react";

interface AudioNarrationControllerProps {
  /** The text block or collection of narratives to read */
  narratives: {
    title: string;
    text: string;
  }[];
  activeTitle?: string;
}

export default function AudioNarrationController({ narratives, activeTitle }: AudioNarrationControllerProps) {
  const [currentNarrativeIdx, setCurrentNarrativeIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1.0); // Playback speed: 0.8, 1.0, 1.2, 1.5
  const [selectedVoiceName, setSelectedVoiceName] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentSentenceInfo, setCurrentSentenceInfo] = useState({ text: "", index: 0 });
  const [supported, setSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentTextRef = useRef<string>("");

  // Sentences array for the current narrative
  const [sentences, setSentences] = useState<string[]>([]);

  // Split narrative into clean, read-friendly sentences
  useEffect(() => {
    if (narratives && narratives[currentNarrativeIdx]) {
      const text = narratives[currentNarrativeIdx].text;
      currentTextRef.current = text;
      
      // Match sentences by splitting smartly on punctuation followed by whitespace
      const splitSentences = text
        .split(/(?<=[.!?])\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      setSentences(splitSentences);
      setCurrentSentenceInfo({ text: splitSentences[0] || "", index: 0 });
    }
    // Stop playing if text shifts
    stopSpeech();
  }, [currentNarrativeIdx, narratives]);

  // Handle voice initialization on browser environments
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for premium or natural-sounding English voices
      const filteredVoices = allVoices.filter(voice => {
        const lang = voice.lang.toLowerCase();
        return lang.includes("en-") || lang.includes("en_");
      });
      
      setVoices(filteredVoices);

      if (filteredVoices.length > 0) {
        // Prefer local natural sounding or premium if available
        const defaultVoice = filteredVoices.find(v => 
          v.name.includes("Natural") || 
          v.name.includes("Google") || 
          v.name.includes("Premium") ||
          v.name.includes("Male")
        ) || filteredVoices[0];
        
        setSelectedVoiceName(defaultVoice.name);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Safely stop synthesis when unmounting component
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Control Functions
  const stopSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentenceInfo({ text: sentences[0] || "", index: 0 });
  };

  const pauseSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const resumeSpeech = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      }
    }
  };

  const startSpeech = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Clear any playing audio
    window.speechSynthesis.cancel();

    const fullText = narratives[currentNarrativeIdx].text;
    const utterance = new SpeechSynthesisUtterance(fullText);
    
    // Set parameters
    utterance.rate = rate;
    
    const chosenVoice = voices.find(v => v.name === selectedVoiceName);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    // Set voice boundaries to track which paragraph/sentence is actively read
    utterance.onboundary = (event) => {
      if (event.name === "sentence" || event.name === "word") {
        const charIndex = event.charIndex;
        // Locate matching sentence
        let accLength = 0;
        for (let i = 0; i < sentences.length; i++) {
          accLength += sentences[i].length + 1; // plus space
          if (charIndex < accLength) {
            setCurrentSentenceInfo({ text: sentences[i], index: i });
            break;
          }
        }
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      // Auto move to next narrative chapter if exists
      if (currentNarrativeIdx < narratives.length - 1) {
        // Stagger briefly before moving to next
        setTimeout(() => {
          setCurrentNarrativeIdx(prev => prev + 1);
        }, 1500);
      } else {
        // Completed reading everything
        setCurrentSentenceInfo({ text: "Reading finished.", index: -1 });
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech Synthesis Utterance error: ", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    setIsPaused(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (isPaused) {
        resumeSpeech();
      } else {
        pauseSpeech();
      }
    } else {
      startSpeech();
    }
  };

  // Adjust speech level on change
  useEffect(() => {
    if (isPlaying && !isPaused) {
      // To apply rate changes gracefully, restart from the current sentence index or close
      const sentencesToRead = sentences.slice(currentSentenceInfo.index).join(" ");
      if (sentencesToRead) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(sentencesToRead);
        utterance.rate = rate;
        
        const chosenVoice = voices.find(v => v.name === selectedVoiceName);
        if (chosenVoice) utterance.voice = chosenVoice;

        utterance.onboundary = (event) => {
          const charIndex = event.charIndex;
          let accLength = 0;
          const currentOffsetSlice = sentences.slice(currentSentenceInfo.index);
          for (let i = 0; i < currentOffsetSlice.length; i++) {
            accLength += currentOffsetSlice[i].length + 1;
            if (charIndex < accLength) {
              setCurrentSentenceInfo({ 
                text: currentOffsetSlice[i], 
                index: currentSentenceInfo.index + i 
              });
              break;
            }
          }
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setIsPaused(false);
          if (currentNarrativeIdx < narratives.length - 1) {
            setTimeout(() => {
              setCurrentNarrativeIdx(prev => prev + 1);
            }, 1200);
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    }
  }, [rate, selectedVoiceName]);

  if (!supported) {
    return (
      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 text-slate-400 text-xs text-center">
        💡 Web Speech narration is not fully supported in this browser environment. Try opening the portal in a new tab for native voice synthesis.
      </div>
    );
  }

  return (
    <div className="bg-[#040812]/95 border border-[#ca8a04]/25 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      
      {/* HEADER CONTROLLER TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-900 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-cinzel font-bold text-yellow-500 tracking-widest animate-pulse">
            <Radio size={12} className="text-yellow-600 animate-spin" />
            <span>Voice Synthesis Broadcast</span>
          </div>
          <h4 className="font-cinzel text-xs font-bold text-slate-200">
            Now Reading: {narratives[currentNarrativeIdx]?.title}
          </h4>
        </div>

        {/* VOICE SELECTOR & VELOCITY */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Rate Button Selector */}
          <div className="flex items-center bg-slate-950 border border-slate-900 rounded-lg p-0.5">
            {[0.8, 1.0, 1.2, 1.4].map((vSpeed) => (
              <button
                key={vSpeed}
                onClick={() => setRate(vSpeed)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                  rate === vSpeed 
                    ? "bg-[#eab308]/20 text-[#eab308] font-bold" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {vSpeed}x
              </button>
            ))}
          </div>

          {/* Voices dropdown option for system */}
          {voices.length > 0 && (
            <select
              value={selectedVoiceName}
              onChange={(e) => setSelectedVoiceName(e.target.value)}
              className="bg-slate-950 border border-slate-900 rounded-lg text-[10px] text-slate-300 font-mono py-1 px-2 focus:ring-1 focus:ring-yellow-500 outline-none max-w-[140px]"
              title="Select voice profile"
            >
              {voices.map((v, i) => (
                <option key={i} value={v.name}>
                  {v.name.replace("Microsoft", "").replace("Google", "").trim()}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* WAVEFORM PLAYBACK HUD */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/70 p-3 rounded-xl border border-slate-900">
        
        {/* Playback Controls */}
        <div className="md:col-span-4 flex items-center justify-center sm:justify-start gap-2.5">
          <button
            onClick={togglePlay}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer ${
              isPlaying && !isPaused
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-gradient-to-r from-yellow-600 to-yellow-500 text-black hover:brightness-110 shadow-md"
            }`}
            title={isPlaying && !isPaused ? "Pause Audio Reading" : "Start Bio Audio Reading"}
            id="btn-narration-play"
          >
            {isPlaying && !isPaused ? <Pause size={17} strokeWidth={2.5} /> : <Play size={17} strokeWidth={2.5} className="ml-0.5" />}
          </button>

          <button
            onClick={stopSpeech}
            disabled={!isPlaying}
            className={`w-9 h-9 rounded-full flex items-center justify-center border border-slate-800 transition-all ${
              isPlaying 
                ? "bg-slate-900 text-slate-200 hover:bg-slate-800 hover:text-rose-400 cursor-pointer" 
                : "bg-slate-950/50 text-slate-600 cursor-not-allowed"
            }`}
            title="Stop Reading Broadcast"
            id="btn-narration-stop"
          >
            <Square size={12} fill="currentColor" />
          </button>

          {/* Symmetrical Animated Voice wave pattern */}
          <div className="flex items-center gap-0.5 h-6 px-2">
            {[1, 2, 3, 4, 5, 4, 3, 2, 1, 3, 5, 2].map((val, idx) => (
              <span 
                key={idx}
                className="w-0.5 bg-yellow-500/90 rounded-full transition-all duration-300 transform origin-bottom"
                style={{
                  height: isPlaying && !isPaused ? `${val * 4}px` : "3px",
                  animation: isPlaying && !isPaused ? `voiceBars 0.6s ease-in-out infinite alternate` : "none",
                  animationDelay: `${idx * 0.05}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Live dynamic ticker text subtitle */}
        <div className="md:col-span-8 px-2">
          {isPlaying ? (
            <div className="space-y-1">
              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={8} className="text-yellow-600" /> Dynamic Transcript highlight
              </span>
              <p className="text-[11px] font-serif italic text-slate-200 leading-relaxed line-clamp-2 pl-2 border-l border-yellow-500/40">
                "{currentSentenceInfo.text}"
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-serif leading-relaxed italic">
              <Info size={13} className="text-[#eab308]/60 flex-shrink-0" />
              <span>Let our synthetic narrator lead you through a professional vocal reading of this iconic legacy.</span>
            </div>
          )}
        </div>

      </div>

      {/* CATEGORY NAV CHAPTERS COMPACT BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin">
        {narratives.map((n, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentNarrativeIdx(idx);
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-cinzel font-semibold tracking-wider whitespace-nowrap transition-all border flex items-center gap-1 cursor-pointer ${
              currentNarrativeIdx === idx
                ? "bg-[#eab308]/15 border-yellow-500/40 text-yellow-500 font-bold"
                : "bg-slate-950/70 border-slate-900 text-slate-400 hover:text-slate-200"
            }`}
          >
            {currentNarrativeIdx === idx && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
            <span>{n.title}</span>
          </button>
        ))}
      </div>

      {/* INJECT ANIMATION INLINE STYLES FOR VOICEWAVE */}
      <style>{`
        @keyframes voiceBars {
          0% { transform: scaleY(0.4); }
          100% { transform: scaleY(2); }
        }
      `}</style>

    </div>
  );
}
