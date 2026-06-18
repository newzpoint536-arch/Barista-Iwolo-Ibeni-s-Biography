import React, { useState, useEffect, useRef } from "react";
import { 
  Scale, 
  History, 
  BookOpen, 
  Quote, 
  ShieldCheck, 
  Award, 
  Users, 
  BookMarked,
  Heart, 
  MessageSquare, 
  Search, 
  Download, 
  Flame, 
  Eye, 
  Send, 
  VolumeX, 
  Volume2, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle,
  FileText,
  Clock,
  Briefcase,
  MapPin,
  Anchor,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { BIOGRAPHY_DATA, Milestone, DocumentItem, Tribute } from "./data";
import GallerySection from "./components/GallerySection";
import SocialShareModal, { ShareDetails } from "./components/SocialShareModal";
import AudioNarrationController from "./components/AudioNarrationController";
import ThreeParticleSystem from "./components/ThreeParticleSystem";

// Audio Narration Chapters
const NARRATION_CHAPTERS = [
  { title: "Introduction", text: BIOGRAPHY_DATA.narratives.introduction },
  { title: "Early Life", text: BIOGRAPHY_DATA.narratives.earlyLife },
  { title: "Legal Career", text: BIOGRAPHY_DATA.narratives.legalCareer },
  { title: "INC Leadership", text: BIOGRAPHY_DATA.narratives.communityINC },
  { title: "Christian Faith", text: BIOGRAPHY_DATA.narratives.christianFaith },
  { title: "Business & Agriculture", text: BIOGRAPHY_DATA.narratives.entrepreneurship },
  { title: "Family Life", text: BIOGRAPHY_DATA.narratives.familyLife }
];

export default function App() {
  // Theme and UI State
  const [activeTab, setActiveTab] = useState<"bio" | "timeline" | "documents" | "gallery" | "guestbook">("bio");
  const [selectedChapter, setSelectedChapter] = useState<"early" | "legal" | "community" | "faith" | "business" | "family">("legal");
  
  // Custom Audio Ambience State (Synthesizer organs/chords)
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Search and Filters
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [selectedDocCategory, setSelectedDocCategory] = useState<string>("All");
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  // Tributes / Guestbook state
  const [tributes, setTributes] = useState<Tribute[]>([]);
  const [tributeCategory, setTributeCategory] = useState<"all" | "family" | "colleague" | "church" | "community">("all");
  const [formData, setFormData] = useState({
    name: "",
    relation: "",
    category: "community",
    message: ""
  });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [loadingTributes, setLoadingTributes] = useState(false);
  const [submittingTribute, setSubmittingTribute] = useState(false);

  // AI Assistant Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; parts: { text: string }[] }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Dynamic Social Share State
  const [shareItem, setShareItem] = useState<ShareDetails | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Audio Narration Toggles
  const [showHeroNarration, setShowHeroNarration] = useState(false);
  const [showBioNarration, setShowBioNarration] = useState(false);

  // Dynamic Timeline Explorer Zoom state (0.5x to 3.0x grid scale resolution)
  const [timelineZoom, setTimelineZoom] = useState<number>(1.0);
  const touchStartDistRef = useRef<number>(0);
  const [enableWheelZoom, setEnableWheelZoom] = useState<boolean>(false);

  // Interactive Quote Slider
  const quotes = [
    "His relevance was not built on noise, but on consistency, reliability, and quiet influence.",
    "A lawyer's lawyer, a peacemaker of clans, and an exemplary advisor in the Lord's cathedral.",
    "Let our battles be guided by intellectual force and legal precision, rather than the sound of gunshots."
  ];
  const [activeQuoteIdx, setActiveQuoteIdxIndex] = useState(0);

  // Fetch tributes on mount & parse shared links
  useEffect(() => {
    fetchTributes();
    
    // Check if the URL carries an automated social share tag to route the views
    const searchParams = new URLSearchParams(window.location.search);
    const activeTabParam = searchParams.get("tab");
    if (activeTabParam && ["bio", "timeline", "documents", "gallery", "guestbook"].includes(activeTabParam)) {
      setActiveTab(activeTabParam as any);
      
      // Auto-focus dynamic views if shared
      setTimeout(() => {
        const element = document.getElementById(`${activeTabParam}-section`) || document.getElementById("gallery-root") || document.getElementById("guestbook-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 800);
    }

    // Quote rotation interval
    const interval = setInterval(() => {
      setActiveQuoteIdxIndex((prev) => (prev + 1) % quotes.length);
    }, 8500);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, chatLoading]);

  // Audio Synthesis Trigger (Choral Ambient Cathedral Organ Code)
  const toggleAmbientSound = () => {
    if (isAudioPlaying) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  };

  const startAmbientSound = () => {
    try {
      // Initialize or resume context
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Root Gain Node for Volume Fade-in
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3.0); // Mild safe master volume
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      // Safe Gregorian / Anglican Pad frequencies (C Major 9 Chord: C3, G3, C4, E4, B4)
      const frequencies = [130.81, 196.00, 261.63, 329.63, 493.88];
      
      oscillatorsRef.current = frequencies.map((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        
        // Soft triangle wave for church-like organ texture
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // Add subtle vibrato
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(3.5 + idx * 0.2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        
        // Relative ratios for softer harmonics on higher frequencies
        const volumeFactor = idx === 0 ? 1.0 : idx === 1 ? 0.8 : 0.6;
        oscGain.gain.setValueAtTime(volumeFactor, ctx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(masterGain);
        
        osc.start();
        return osc;
      });

      setIsAudioPlaying(true);
    } catch (e) {
      console.warn("Could not initiate ambient synthesizer. Browser permissions apply.", e);
    }
  };

  const stopAmbientSound = () => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      // Soft Fade out to avoid clicks
      gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      setTimeout(() => {
        oscillatorsRef.current.forEach((osc) => {
          try { osc.stop(); } catch(e){}
        });
        oscillatorsRef.current = [];
        setIsAudioPlaying(false);
      }, 1600);
    } else {
      setIsAudioPlaying(false);
    }
  };

  // API Call: Fetch Tributes
  const fetchTributes = async () => {
    setLoadingTributes(true);
    try {
      const response = await fetch("/api/tributes");
      if (response.ok) {
        const data = await response.json();
        setTributes(data);
      } else {
        setTributes(BIOGRAPHY_DATA.defaultTributes);
      }
    } catch (e) {
      console.warn("Backend unavailable, using localized mock database state.");
      setTributes(BIOGRAPHY_DATA.defaultTributes);
    } finally {
      setLoadingTributes(false);
    }
  };

  // API Call: Submit a tribute
  const handleTributeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!formData.name.trim() || !formData.message.trim()) {
      setFormError("Kindly include both your name and a genuine tribute text.");
      return;
    }

    setSubmittingTribute(true);
    try {
      const response = await fetch("/api/tributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newTribute = await response.json();
        setTributes((prev) => [newTribute, ...prev]);
        setFormSuccess(true);
        setFormData({ name: "", relation: "", category: "community", message: "" });
      } else {
        const errorData = await response.json();
        setFormError(errorData.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      // Fallback local append when server offline or during static compilation
      const localNew: Tribute = {
        id: `trib-fallback-${Date.now()}`,
        name: formData.name.trim(),
        relation: formData.relation.trim() || "Independent Visitor",
        message: formData.message.trim(),
        candlesLit: 1,
        date: new Date().toISOString().split("T")[0],
        category: formData.category as any
      };
      setTributes((prev) => [localNew, ...prev]);
      setFormSuccess(true);
      setFormData({ name: "", relation: "", category: "community", message: "" });
    } finally {
      setSubmittingTribute(false);
    }
  };

  // API Call: Light a candle for a guest block
  const handleLightCandle = async (id: string) => {
    // Optimistic UI state update
    setTributes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, candlesLit: (t.candlesLit || 0) + 1 } : t))
    );

    try {
      const response = await fetch(`/api/tributes/${id}/light`, {
        method: "POST"
      });
      if (response.ok) {
        const updated = await response.json();
        // Sync with absolute backend coordinates
        setTributes((prev) => prev.map((t) => (t.id === id ? updated : t)));
      }
    } catch (e) {
      console.log("Saving flame count to localized sandbox state.");
    }
  };

  // API Call: Gemini AI Biography Chatbot Q&A
  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || chatLoading) return;

    const userText = chatMessage.trim();
    setChatMessage("");

    // Add locally to visual thread
    const updatedHistory = [
      ...chatHistory,
      { role: "user" as const, parts: [{ text: userText }] }
    ];
    setChatHistory(updatedHistory);
    setChatLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          history: chatHistory
        })
      });

      if (response.ok) {
        const rData = await response.json();
        setChatHistory((prev) => [
          ...prev,
          { role: "model" as const, parts: [{ text: rData.text }] }
        ]);
      } else {
        const rError = await response.json();
        setChatHistory((prev) => [
          ...prev,
          { 
            role: "model" as const, 
            parts: [{ text: "Forgive me, my archival relay is currently unresponsive. Please check if your GEMINI_API_KEY is active in the environment secrets." }] 
          }
        ]);
      }
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { 
          role: "model" as const, 
          parts: [{ text: "Our digital systems are offline. Late Barrister's quiet legacy continues to be visible in the sections behind." }] 
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Chat preset tags to guide the user
  const chatPills = [
    "Tell me about Obiyingi Chambers",
    "What was his role in the INC?",
    "How did he support the Anglican church?",
    "About his fish farm enterprise"
  ];

  // Filters for Documents catalog
  const filteredDocs = BIOGRAPHY_DATA.documents.filter((doc) => {
    const matchesCategory = selectedDocCategory === "All" || doc.category === selectedDocCategory;
    const matchesSearch = doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) || 
                          doc.summary.toLowerCase().includes(docSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filters for Tributes guestbook
  const filteredTributes = tributes.filter((trib) => {
    if (tributeCategory === "all") return true;
    return trib.category === tributeCategory;
  });

  return (
    <div className="min-h-screen bg-[#03060c] text-slate-100 flex flex-col relative antialiased selection:bg-[#d4af37] selection:text-black">
      
      {/* BACKGROUND GRAPHIC MOTIFS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,34,56,0.5),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(34,26,16,0.3),transparent_70%)] pointer-events-none" />
      
      {/* FLOATING TOP BAR - Respectful, Cinematic */}
      <header className="sticky top-0 z-40 bg-[#03060c]/90 backdrop-blur-md border-b border-yellow-600/10 px-4 md:px-8 py-4 transition-all" id="main-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#d4af37]/30 bg-gradient-to-br from-[#0c1424] to-[#1e140a] flex items-center justify-center text-[#d4af37] font-bold shadow-md shadow-[#000]">
              II
            </div>
            <div>
              <span className="block font-cinzel text-xs uppercase tracking-[0.25em] text-[#d4af37]">The Legacy of</span>
              <span className="block font-playfair text-lg font-bold tracking-wide italic text-slate-100">Barr. Ibeni Iwolo</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex flex-wrap justify-center items-center gap-1 md:gap-3">
            <button
              onClick={() => setActiveTab("bio")}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                activeTab === "bio" 
                  ? "bg-[#d4af37]/15 text-[#eab308] border border-[#d4af37]/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
              }`}
              id="nav-biography"
            >
              Biography
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                activeTab === "timeline" 
                  ? "bg-[#d4af37]/15 text-[#eab308] border border-[#d4af37]/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
              }`}
              id="nav-timeline"
            >
              Milestones
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                activeTab === "documents" 
                  ? "bg-[#d4af37]/15 text-[#eab308] border border-[#d4af37]/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
              }`}
              id="nav-documents"
            >
              Legal Archive
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                activeTab === "gallery" 
                  ? "bg-[#d4af37]/15 text-[#eab308] border border-[#d4af37]/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
              }`}
              id="nav-gallery"
            >
              Archival Gallery
            </button>
            <button
              onClick={() => setActiveTab("guestbook")}
              className={`px-3 py-1.5 rounded text-xs uppercase tracking-widest font-semibold transition-all duration-300 ${
                activeTab === "guestbook" 
                  ? "bg-[#d4af37]/15 text-[#eab308] border border-[#d4af37]/20" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/40"
              }`}
              id="nav-guestbook"
            >
              Memorial Wall
            </button>

            {/* Ambient Choral Synthesizer Toggle */}
            <button
              onClick={toggleAmbientSound}
              className={`ml-2 p-2 rounded-full border transition-all duration-300 ${
                isAudioPlaying 
                  ? "border-[#d4af37] bg-yellow-500/10 text-[#eab308] animate-pulse" 
                  : "border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200"
              }`}
              title="Toggle Cathedral Choir Ambience Organ"
              id="btn-ambience-toggle"
            >
              {isAudioPlaying ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </nav>
        </div>
      </header>

      {/* 1. HERO SECTION - Cinematic & Grounded */}
      <section className="relative w-full overflow-hidden border-b border-yellow-600/10" id="hero-section">
        {/* Three.js Particle System Interactivity Layer */}
        <ThreeParticleSystem />

        {/* Cinematic Backdrop Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060c] via-transparent to-[#03060c]/80 z-10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#03060c] to-transparent z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24 relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Box: Portrait View */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative group max-w-sm w-full">
                {/* Visual Frames of Legal Prestige */}
                <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-[#ca8a04]/40 via-[#eab308]/20 to-[#854d0e]/40 opacity-80 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200" />
                <div className="relative rounded-2xl bg-[#070b14] p-2 border border-[#d4af37]/30 shadow-2xl overflow-hidden aspect-[4/5] flex items-center justify-center">
                  <img
                    src="/src/assets/images/barrister_portrait_1779896056884.png"
                    alt="Late Barrister Ibeni Iwolo"
                    className="w-full h-full object-cover rounded-xl grayscale-[15%] group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-[1.03]"
                  />
                  {/* Elegant Golden Border Filigree */}
                  <div className="absolute inset-6 border border-yellow-400/10 pointer-events-none rounded-lg" />
                  <div className="absolute bottom-5 inset-x-5 bg-black/75 backdrop-blur-sm border border-[#d4af37]/20 p-3 rounded text-center">
                    <p className="font-cinzel text-xs text-[#d4af37] tracking-[0.2em] uppercase">Honorable Counsel</p>
                    <p className="font-playfair text-lg text-amber-50">1960 – 2024</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Box: Hero Typography Reveal */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
              
              <div className="space-y-2">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ca8a04]/10 border border-[#ca8a04]/20 text-xs tracking-widest uppercase text-yellow-500 font-semibold">
                  <Clock size={12} className="text-yellow-500" /> Late Barrister Ibeni Iwolo
                </span>
                <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-black text-slate-100 tracking-wide leading-tight">
                  A Life of <br />
                  <span className="gold-gradient-text gold-glow italic font-playfair font-normal">Quiet Influence</span>
                </h1>
                <p className="text-sm md:text-base font-cinzel text-[#d4af37]/80 tracking-[0.3em] font-medium uppercase">
                  Service, Faith, and Enduring Legacy
                </p>
              </div>

              {/* Quote Slider overlay */}
              <div className="bg-[#0c1424]/60 backdrop-blur-sm border-l-2 border-[#d4af37] p-5 rounded-r-xl shadow-lg relative overflow-hidden max-w-2xl">
                <div className="absolute top-2 right-4 text-[#d4af37]/10">
                  <Quote size={48} className="rotate-180" />
                </div>
                <p className="text-xs text-yellow-500 font-cinzel uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1">
                  <Anchor size={12} /> Golden Principle
                </p>
                <p className="text-slate-300 font-playfair italic text-sm md:text-md leading-relaxed h-[3.5rem] flex items-center">
                  "{quotes[activeQuoteIdx]}"
                </p>
                
                {/* Progress Indicators */}
                <div className="flex gap-1.5 mt-3">
                  {quotes.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveQuoteIdxIndex(idx)}
                      className={`h-1 rounded transition-all duration-300 ${
                        idx === activeQuoteIdx ? "w-8 bg-[#d4af37]" : "w-2 bg-slate-700 hover:bg-slate-500"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Cinematic Action Triggers */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => {
                    setActiveTab("bio");
                    const el = document.getElementById("chronicles-title");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-[#eab308] hover:bg-[#ca8a04] text-black font-cinzel text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-300 shadow-xl shadow-[#ca8a04]/10 transform hover:-translate-y-0.5"
                  id="btn-read-bio"
                >
                  Read Biography
                </button>
                <button
                  onClick={() => {
                    setActiveTab("timeline");
                    const el = document.getElementById("timeline-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 border border-slate-700 hover:border-[#d4af37] text-slate-200 hover:text-white font-cinzel text-xs font-bold tracking-widest uppercase rounded-lg bg-slate-950/40 hover:bg-slate-900/40 transition-all duration-300"
                  id="btn-explore-timeline"
                >
                  Explore Milestones
                </button>
                <button
                  onClick={() => {
                    setActiveTab("guestbook");
                    const el = document.getElementById("guestbook-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 border border-[#ca8a04]/40 hover:border-[#d4af37] text-yellow-500 font-cinzel text-xs font-bold tracking-widest uppercase rounded-lg bg-[#eab308]/5 hover:bg-[#eab308]/10 transition-all duration-300"
                  id="btn-view-guestbook"
                >
                  Sign Memorial Wall
                </button>
                <button
                  onClick={() => setShowHeroNarration(!showHeroNarration)}
                  className={`px-6 py-3 border font-cinzel text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    showHeroNarration 
                      ? "border-yellow-500 bg-yellow-500/20 text-[#eab308]" 
                      : "border-slate-800 bg-slate-950/40 text-slate-300 hover:border-yellow-500/50 hover:text-white hover:bg-slate-900/40"
                  }`}
                  id="btn-hero-narration-toggle"
                >
                  <span>🎙️</span>
                  <span>{showHeroNarration ? "Stop Narrator" : "Vocal Audio"}</span>
                </button>
              </div>

              {/* Optional Hero Audio Narration Overlay Widget */}
              {showHeroNarration && (
                <div className="pt-4 max-w-2xl animate-fade-in">
                  <AudioNarrationController 
                    narratives={NARRATION_CHAPTERS}
                  />
                </div>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* 2. OVERVIEW METRICS SECTION - Authentic impact indices (Counters) */}
      <section className="bg-slate-950/60 border-y border-yellow-600/10 py-8 relative" id="metrics-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {BIOGRAPHY_DATA.metrics.map((m, idx) => (
              <div key={idx} className="p-4 border border-slate-900 hover:border-yellow-600/10 rounded-xl transition-all duration-500 bg-[#060a12]/85">
                <span className="block font-cinzel text-2xl lg:text-3xl font-black text-[#eab308] tracking-widest mb-1 shadow-sm">
                  {m.value}
                </span>
                <span className="block text-slate-400 text-xs sm:text-xs tracking-wider uppercase">
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT CONTROLLER - SPA tabs but deep contents */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-30">
        
        {/* TAB 1: STORYTELLING BIOGRAPHY CHRONICLES */}
        {activeTab === "bio" && (
          <div className="space-y-12">
            
            {/* Introductory Narrative Block */}
            <div className="bg-[#0a0f1d]/75 border border-slate-900 rounded-3xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <h2 className="font-cinzel text-yellow-500 text-xs uppercase tracking-[0.3em] font-semibold" id="chronicles-title">The Patriarch Declared</h2>
                  <h3 className="font-playfair text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
                    "Barrister Ibeni Iwolo was a man of remarkable depth, outstanding intellectual pedigree, and unmatched humility."
                  </h3>
                  <div className="h-0.5 w-16 bg-[#d4af37]" />
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed font-light">
                    {BIOGRAPHY_DATA.narratives.introduction}
                  </p>
                </div>
                
                {/* Legal Medallion SVG Symbol */}
                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-48 h-48 rounded-full border border-[#d4af37]/20 bg-gradient-to-tr from-slate-950 to-[#121926] p-4 flex flex-col items-center justify-center text-center shadow-inner relative group">
                    <div className="absolute inset-1.5 border border-dashed border-[#d4af37]/20 rounded-full" />
                    <Scale className="text-[#eab308] w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-500" />
                    <span className="font-cinzel text-xxs tracking-[0.2em] font-bold text-slate-300 block uppercase">Obiyingi Chambers</span>
                    <span className="text-[10px] text-[#ca8a04] block font-semibold mt-0.5">Yenagoa, Bayelsa</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Bio Audio Narration Toggle & Integrated Controller */}
            <div className="bg-[#050811] rounded-2xl border border-slate-900 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-cinzel text-xs font-bold tracking-wider text-slate-200 uppercase flex items-center gap-1.5 animate-pulse">
                    <span>🎙️</span> Broadcast Voice Narration
                  </h4>
                  <p className="text-xs text-slate-400 font-serif">
                    Allow a synthetic professional narrator to read each chapter of the Late Barrister's biography with adjustable speeds.
                  </p>
                </div>
                <button
                  onClick={() => setShowBioNarration(!showBioNarration)}
                  className={`px-4 py-2 border rounded-lg font-cinzel font-bold text-[10px] tracking-widest uppercase transition-all duration-300 cursor-pointer ${
                    showBioNarration 
                      ? "bg-yellow-500/10 border-[#eab308] text-[#eab308]" 
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-[#d4af37] hover:text-white"
                  }`}
                  id="btn-bio-narration-toggle"
                >
                  {showBioNarration ? "Collapse Narrator" : "Activate Narrator voice"}
                </button>
              </div>

              {showBioNarration && (
                <div className="animate-fade-in pt-2">
                  <AudioNarrationController 
                    narratives={NARRATION_CHAPTERS}
                  />
                </div>
              )}
            </div>

            {/* Thematic chapters Selectors */}
            <div>
              <div className="text-center space-y-2 mb-8">
                <h3 className="font-cinzel text-xs text-[#d4af37] tracking-[0.3em] font-bold uppercase">Chronicle Chapters</h3>
                <h4 className="font-playfair text-2xl font-bold">Six Pillars of an Honorable Life</h4>
              </div>

              {/* Visual Grid Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
                {[
                  { id: "legal", label: "Legal Practice", icon: Scale, count: "1987-2024" },
                  { id: "community", label: "Ijaw Leadership", icon: Users, count: "INC Central" },
                  { id: "faith", label: "Christian Faith", icon: BookMarked, count: "Anglican Adv." },
                  { id: "early", label: "Early Life", icon: History, count: "Born 1960" },
                  { id: "business", label: "Enterprise", icon: Award, count: "Fish Farm" },
                  { id: "family", label: "Family Pillar", icon: Heart, count: "Patriarch" }
                ].map((item) => {
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedChapter(item.id as any)}
                      className={`p-4 rounded-xl border text-center flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                        selectedChapter === item.id 
                          ? "bg-gradient-to-b from-[#0e172a] to-[#121b2e] border-[#eab308] text-yellow-500 shadow-lg shadow-[#ca8a04]/5" 
                          : "border-slate-900 bg-[#050812]/90 text-slate-400 hover:text-slate-200 hover:border-slate-800"
                      }`}
                    >
                      <IconComp className={`h-6 w-6 ${selectedChapter === item.id ? "text-yellow-500" : "text-slate-500"}`} />
                      <span className="block text-xs font-cinzel font-bold tracking-wider">{item.label}</span>
                      <span className="block text-[10px] opacity-60 font-mono italic">{item.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Chapter content Display - Documentary style */}
              <div className="bg-[#060a12] border border-slate-900 rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
                
                {/* Visual half: Beautiful theme images or interactive stained glass */}
                <div className="lg:col-span-4 bg-slate-950 relative min-h-[300px] flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-900">
                  {selectedChapter === "faith" ? (
                    <>
                      <img 
                        src="/src/assets/images/stained_glass_1779896081028.png" 
                        alt="Anglican Cathedral Stained Glass Symbol" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-6 text-center z-10 px-4">
                        <p className="font-cinzel text-xs text-yellow-500 tracking-[0.2em] uppercase">Anglican Communion</p>
                        <p className="font-playfair text-sm italic text-slate-100">Diocesan Secretary & Legal Adviser</p>
                      </div>
                    </>
                  ) : selectedChapter === "legal" ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#02050b] via-[#09101d] to-[#040913] " />
                      <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-[#d4af37]/30 flex items-center justify-center text-[#eab308] mb-4 relative z-10 animate-pulse">
                        <Scale size={32} />
                      </div>
                      <div className="absolute bottom-6 text-center z-10 px-4">
                        <p className="font-cinzel text-xs text-yellow-500 tracking-[0.2em] uppercase">Obiyingi Chambers</p>
                        <p className="font-playfair text-[11px] text-slate-400 italic">"Advocate of Peace, Defense of the Weak"</p>
                      </div>
                    </>
                  ) : selectedChapter === "community" ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#02050b] via-[#100c05] to-[#040913] " />
                      <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-[#d4af37]/30 flex items-center justify-center text-[#eab308] mb-4 relative z-10">
                        <Users size={32} />
                      </div>
                      <div className="absolute bottom-6 text-center z-10 px-4">
                        <p className="font-cinzel text-xs text-yellow-500 tracking-[0.2em] uppercase">Ijaw National Congress</p>
                        <p className="font-playfair text-[11px] text-slate-400 italic">Central Zone Acting Chairman</p>
                      </div>
                    </>
                  ) : selectedChapter === "early" ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#02050b] via-[#0c1421] to-[#040913] " />
                      <h4 className="font-cinzel text-6xl text-slate-800/40 font-black absolute inset-0 flex items-center justify-center select-none">1960</h4>
                      <div className="absolute bottom-6 text-center z-10 px-4">
                        <p className="font-cinzel text-xs text-yellow-500 tracking-[0.2em] uppercase">Okolobiri Town</p>
                        <p className="font-playfair text-[11px] text-slate-400 italic">Birth, Schools, and Foundations</p>
                      </div>
                    </>
                  ) : selectedChapter === "business" ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#02050b] via-[#05140b] to-[#040913] " />
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 relative z-10">
                        <Briefcase size={32} />
                      </div>
                      <div className="absolute bottom-6 text-center z-10 px-4">
                        <p className="font-cinzel text-xs text-emerald-400 tracking-[0.2em] uppercase">Grassroots Aquaculture</p>
                        <p className="font-playfair text-[11px] text-slate-400 italic">Organic Enterprise & Fish Farming</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#02050b] via-[#1a0a0d] to-[#040913] " />
                      <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4 relative z-10">
                        <Heart size={32} />
                      </div>
                      <div className="absolute bottom-6 text-center z-10 px-4">
                        <p className="font-cinzel text-xs text-rose-400 tracking-[0.2em] uppercase">Mildred & The Family</p>
                        <p className="font-playfair text-[11px] text-slate-400 italic">Generations of Uncompromising Ethic</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Narrative half: Large content narrative text */}
                <div className="lg:col-span-8 p-6 md:p-12 space-y-4">
                  
                  {/* Title of specific detail */}
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded bg-yellow-500/10 text-[#eab308]">
                      {selectedChapter === "legal" && <Scale size={18} />}
                      {selectedChapter === "community" && <Users size={18} />}
                      {selectedChapter === "faith" && <BookMarked size={18} />}
                      {selectedChapter === "early" && <History size={18} />}
                      {selectedChapter === "business" && <Award size={18} />}
                      {selectedChapter === "family" && <Heart size={18} />}
                    </span>
                    <div>
                      <h4 className="font-cinzel text-[10px] tracking-widest text-slate-500 uppercase">Chronicle Chapter Overview</h4>
                      <h3 className="font-cinzel text-xl text-yellow-500 font-bold tracking-wide">
                        {selectedChapter === "legal" && "Judicial Footprints & Obiyingi Chambers"}
                        {selectedChapter === "community" && "Statesmanship in the Ijaw National Congress"}
                        {selectedChapter === "faith" && "Ecclesiastical Secretarial Stewardship"}
                        {selectedChapter === "early" && "Ancestral Creeks, Primary Debates & Law School"}
                        {selectedChapter === "business" && "Grassroots Aquaculture & Agricultural Devotion"}
                        {selectedChapter === "family" && "A Patriarch of Unending Compassion"}
                      </h3>
                    </div>
                  </div>

                  <div className="h-px bg-slate-900" />

                  {/* Body textual narrative */}
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed whitespace-pre-line font-light">
                    {selectedChapter === "legal" && BIOGRAPHY_DATA.narratives.legalCareer}
                    {selectedChapter === "community" && BIOGRAPHY_DATA.narratives.communityINC}
                    {selectedChapter === "faith" && BIOGRAPHY_DATA.narratives.christianFaith}
                    {selectedChapter === "early" && BIOGRAPHY_DATA.narratives.earlyLife}
                    {selectedChapter === "business" && BIOGRAPHY_DATA.narratives.entrepreneurship}
                    {selectedChapter === "family" && BIOGRAPHY_DATA.narratives.familyLife}
                  </p>

                  {/* Highlights Bullet pills */}
                  <div className="pt-2">
                    <h5 className="font-cinzel text-xs text-[#d4af37] tracking-wider mb-2 font-bold uppercase">Enduring Core Legacies</h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedChapter === "legal" && ["Obiyingi Chambers", "Pro-Bono Defense", "50+ Counsel Mentored", "Yenagoa Bar Pillar"].map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400">
                          ✓ {p}
                        </span>
                      ))}
                      {selectedChapter === "community" && ["INC Central Zone acting Chair", "National Reconciliation Architect", "Diplomatic Clan Pacifier", "Regional Ecology Advocacy"].map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400">
                          ✓ {p}
                        </span>
                      ))}
                      {selectedChapter === "faith" && ["Diocesan Bishop Legal Advisor", "Anglican Canon Law Translator", "Boys' Brigade Patron", "Diocese of Niger Delta West"].map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400">
                          ✓ {p}
                        </span>
                      ))}
                      {selectedChapter === "early" && ["Central School Okolobiri", "Gbarainowei Grammar School", "Senior Prefect & Debater", "Rivers State University"].map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400">
                          ✓ {p}
                        </span>
                      ))}
                      {selectedChapter === "business" && ["Aquaculture Enterprise", "Yenagoa Organic Farms", "Youth Job Generator", "Vocational Training Hub"].map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400">
                          ✓ {p}
                        </span>
                      ))}
                      {selectedChapter === "family" && ["Marriage & Children", "Okolobiri Sanctuary", "50+ Academic Tuition Trusts", "Mentoring the Next Gen"].map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded bg-slate-950 border border-slate-900 text-slate-400">
                          ✓ {p}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE BIOGRAPHY TIMELINE */}
        {activeTab === "timeline" && (() => {
          // Comprehensive milestones weaved with high granularity insights
          const allTimelineItems = [
            {
              year: "1960",
              title: "Birth of a Statesman",
              category: "personal",
              description: "Born into the historic Gbarain Clan in Okolobiri, Bayelsa State, during Nigeria's year of independence.",
              details: "His childhood was closely connected with the riverside communities, learning traditional lore, language, and cultural ethics from elder fishermen and storytellers.",
              minZoom: 0.5
            },
            {
              year: "1968",
              title: "Creek Protection & Civil War Resilience",
              category: "personal",
              description: "Surviving in Gbarain creeks during political turbulence, reinforcing his core conviction in human rights advocacy.",
              details: "This era of hardship laid the foundations for his future commitments to regional pacification and local social justice.",
              minZoom: 1.5,
              isSubRecord: true
            },
            {
              year: "1973",
              title: "Primary Education Honors",
              category: "academic",
              description: "Completed his primary education at Central School Okolobiri, earning top honors and writing skills.",
              details: "His schoolmasters noted his natural eloquence and passion for debate even in childhood.",
              minZoom: 0.5
            },
            {
              year: "1979",
              title: "Secondary Education Distinction",
              category: "academic",
              description: "Graduated with brilliant marks from Gbarainowei Grammar School, Okolobiri.",
              details: "He served as a senior prefect, guiding student-teacher relations and establishing the literary and debating society.",
              minZoom: 0.5
            },
            {
              year: "1982",
              title: "Courtroom Apprenticeship & Early Passion",
              category: "legal",
              description: "Supported senior counsels as an apprentice, experiencing the inner workings of regional judiciary divisions.",
              details: "This early court observer experience crystallized his dream of establishing Obiyingi Chambers to safeguard his community.",
              minZoom: 1.5,
              isSubRecord: true
            },
            {
              year: "1985",
              title: "Rivers State University LL.B",
              category: "academic",
              description: "Admitted into the Rivers State University of Science and Technology, Port Harcourt to read Law.",
              details: "Excelled in constitutional law, mock court debates, and administrative jurisprudence, sparking his ultimate passion for human defense.",
              minZoom: 0.5
            },
            {
              year: "1987",
              title: "Calling to the Nigerian Bar",
              category: "legal",
              description: "Successfully graduated from the Nigerian Law School in Lagos and was called to the Supreme Court of Nigeria.",
              details: "Began his legal career in Port Harcourt before moving back to Yenagoa to directly impact his home state.",
              minZoom: 0.5
            },
            {
              year: "1991",
              title: "Maritime Rights & Ecological Study",
              category: "legal",
              description: "Contributed research on indigenous oil-spill liabilities, establishing a robust scholarly framework for compensation.",
              details: "His academic drafts on community-based compensation models were cited by legal scholars defending Niger Delta villages.",
              minZoom: 2.0,
              isSubRecord: true
            },
            {
              year: "1997",
              title: "Obiyingi Chambers Inauguration",
              category: "legal",
              description: "Founded Ibeni Iwolo & Associates (Obiyingi Chambers) in Yenagoa.",
              details: "The chambers stood as a fortress of constitutional defense, advocating for land reform, environmental justice, and pro-bono defense for indigent citizens.",
              minZoom: 0.5
            },
            {
              year: "2001",
              title: "Okolobiri Land Restitution Victory",
              category: "legal",
              description: "Secured pro-bono defense establishing local smallholders' land ownership rights against procedural defect claims.",
              details: "This landmark local settlement defended families and widows, keeping traditional farmsteads inside community domains.",
              minZoom: 2.0,
              isSubRecord: true
            },
            {
              year: "2005",
              title: "INC Central Zone Vice Chairmanship",
              category: "leadership",
              description: "Elected as Central Zone Vice Chairman of the apex Ijaw National Congress.",
              details: "He drove high-stakes regional dialogues, negotiating resource development, environmental stewardship, and advocating for minorities.",
              minZoom: 0.5
            },
            {
              year: "2010",
              title: "Anglican Diocese Appointment",
              category: "faith",
              description: "Appointed Diocesan Secretary and Legal Adviser to the Bishop of the Diocese of Niger Delta West.",
              details: "Rendered free, dedicated canon-legal counsel, structured estate acquisitions for standard missions, and reviewed constitutional guidelines of the church.",
              minZoom: 0.5
            },
            {
              year: "2012",
              title: "Anglican Liturgy Native Translation",
              category: "faith",
              description: "Commissioned the translation of key communion liturgy and catechism books into the local Ijaw dialects.",
              details: "Ensured older, non-English literate community elders could actively worship and participate in ecclesiastical rituals.",
              minZoom: 2.5,
              isSubRecord: true
            },
            {
              year: "2014",
              title: "INC National Reconciliation Lead",
              category: "leadership",
              description: "Appointed to the INC National Reconciliation Committee as a primary mediator.",
              details: "Brokered complex community-border peace pacts, drafted legal terms of friendship between historically rival settlements, and united central political fractions.",
              minZoom: 0.5
            },
            {
              year: "2018",
              title: "Grassroots Aquaculture Launch",
              category: "personal",
              description: "Established a standard commercial fish breeding enterprise in Yenagoa.",
              details: "Pioneered localized organic fish ponds to fight hunger, boost local enterprise index, and train youth in technical farming skills.",
              minZoom: 0.5
            },
            {
              year: "2021",
              title: "Vocational Farming Empowerment Seminars",
              category: "personal",
              description: "Hosted direct training seminars on aquaculture, empowering local youth towards alternative economic independence.",
              details: "Sponsored 20 startup equipment kits for promising youth trainees to establish local Gbarain aquaculture enterprises.",
              minZoom: 2.5,
              isSubRecord: true
            },
            {
              year: "2024",
              title: "A Peaceful Transition",
              category: "personal",
              description: "Passed on peacefully, leaving behind a pristine legacy of honor, deep integrity, and community faith.",
              details: "Celebrated by the legal community of Bayelsa, the Anglican hierarchy, the INC, and thousands of mentored youth across West Africa.",
              minZoom: 0.5
            }
          ];

          // Filter according to current timelineZoom Level
          const filteredMilestones = allTimelineItems.filter(m => timelineZoom >= m.minZoom);

          // Get labels & description details for the zoom indicators
          let zoomLabel = "Standard Biographical Path";
          let zoomSubLabel = "Documenting core milestones & key events.";
          if (timelineZoom < 1.0) {
            zoomLabel = "Compressed Macro Overview";
            zoomSubLabel = "Compact bird's-eye view of high importance milestones.";
          } else if (timelineZoom >= 1.5 && timelineZoom < 2.5) {
            zoomLabel = "Expanded Chronicle Mode";
            zoomSubLabel = "Extra intermediate events and historical sub-records revealed!";
          } else if (timelineZoom >= 2.5) {
            zoomLabel = "Microscope High-Resolution Legacy";
            zoomSubLabel = "Every sub-insight, auxiliary seminar event, and liturgical draft fully detailed!";
          }

          // Generate Ruler Year ticks dynamically based on zoom factor to render on the side
          const startYear = 1960;
          const endYear = 2024;
          const yearTicks: number[] = [];
          
          let tickStep = 10;
          if (timelineZoom >= 2.5) {
            tickStep = 2;
          } else if (timelineZoom >= 1.5) {
            tickStep = 5;
          } else if (timelineZoom >= 0.9) {
            tickStep = 10;
          } else {
            tickStep = 15;
          }

          for (let y = startYear; y <= endYear; y += tickStep) {
            yearTicks.push(y);
          }

          // Handle double-finger pinching gestures for touchscreens
          const handleTouchStart = (e: React.TouchEvent) => {
            if (e.touches.length === 2) {
              const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              touchStartDistRef.current = dist;
            }
          };

          const handleTouchMove = (e: React.TouchEvent) => {
            if (e.touches.length === 2 && touchStartDistRef.current > 0) {
              const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
              );
              const ratio = dist / touchStartDistRef.current;
              setTimelineZoom(prev => Math.min(3.0, Math.max(0.5, Number((prev * (ratio > 1 ? 1.02 : 0.98)).toFixed(2)))));
              touchStartDistRef.current = dist;
            }
          };

          // Handle scroll wheel zooming when hovering container
          const handleTimelineWheel = (e: React.WheelEvent) => {
            if (e.altKey || e.ctrlKey || e.metaKey || enableWheelZoom) {
              e.preventDefault();
              const factor = e.deltaY < 0 ? 0.1 : -0.1;
              setTimelineZoom(prev => Math.min(3.0, Math.max(0.5, Number((prev + factor).toFixed(1)))));
            }
          };

          return (
            <div className="space-y-8" id="timeline-section">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-[#eab308] text-xs font-cinzel tracking-[0.3em] font-bold uppercase">Historic Progression</span>
                <h2 className="font-cinzel text-3xl font-black">Interactive Life Journey</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  A chronologically sequenced walkthrough documenting major steps, achievements, and structural shifts from birth (1960) to final departure.
                </p>
              </div>

              {/* DYNAMIC ZOOM DASHBOARD CONTROLLERS */}
              <div className="bg-[#050912]/95 border border-[#ca8a04]/20 p-5 rounded-2xl max-w-3xl mx-auto space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Info Column */}
                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-1">
                        <Sparkles size={10} className="animate-spin" /> {timelineZoom.toFixed(1)}x Zoom Resolution
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {filteredMilestones.length} of {allTimelineItems.length} Milestones Visible
                      </span>
                    </div>
                    <h4 className="font-cinzel text-sm font-bold text-slate-100 uppercase tracking-wider">
                      {zoomLabel}
                    </h4>
                    <p className="text-xs text-slate-400 font-serif leading-relaxed">
                      {zoomSubLabel}
                    </p>
                  </div>

                  {/* Range Slider & Quick steps buttons */}
                  <div className="flex flex-col gap-3 min-w-[240px]">
                    <div className="flex items-center gap-2 bg-slate-950 p-1 border border-slate-900 rounded-xl">
                      <button
                        onClick={() => setTimelineZoom(prev => Math.max(0.5, Number((prev - 0.2).toFixed(1))))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                        title="Zoom Out (Collapse Time)"
                      >
                        <ZoomOut size={14} />
                      </button>

                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={timelineZoom}
                        onChange={(e) => setTimelineZoom(parseFloat(e.target.value))}
                        className="w-full accent-yellow-500 bg-slate-800 h-1.5 rounded-lg outline-none cursor-pointer"
                      />

                      <button
                        onClick={() => setTimelineZoom(prev => Math.min(3.0, Number((prev + 0.2).toFixed(1))))}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                        title="Zoom In (Expand Time)"
                      >
                        <ZoomIn size={14} />
                      </button>

                      <button
                        onClick={() => setTimelineZoom(1.0)}
                        className="p-1.5 rounded-lg text-yellow-500 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                        title="Reset standard level"
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>

                    {/* Wheel zoom switch helper */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <label htmlFor="chk-wheel-zoom" className="flex items-center gap-1.5 cursor-pointer hover:text-slate-300 transition-colors">
                        <input 
                          type="checkbox"
                          id="chk-wheel-zoom"
                          checked={enableWheelZoom}
                          onChange={(e) => setEnableWheelZoom(e.target.checked)}
                          className="accent-yellow-500"
                        />
                        <span>Scroll over Timeline to zoom</span>
                      </label>
                      <span className="italic text-[10px] text-[#eab308]/60">Or Alt+Scroll anytime</span>
                    </div>

                  </div>

                </div>

                {/* Mobile pinch indicator help banner */}
                <div className="hidden sm:block text-[10px] font-serif italic text-slate-500 border-t border-slate-900/60 pt-2 pb-0.5 text-center">
                  💡 Spacing, years ruler density, and detailed intermediate sub-milestones expand or collapse dynamically as you scale.
                </div>
              </div>

              {/* TIMELINE VIEW GRID WRAPPER WITH PINCH & WHEEL LISTENERS */}
              <div 
                className="relative max-w-4xl mx-auto flex gap-6 px-1 py-6 transition-all duration-300"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onWheel={handleTimelineWheel}
              >
                
                {/* 1. DYNAMIC YEARS RULER GRAPH (LHS) */}
                <div className="hidden md:flex flex-col justify-between w-20 py-4 font-mono text-[10px] text-slate-500 border-r border-slate-900/80 pr-4 select-none">
                  {yearTicks.map((yTick) => {
                    const isDecade = yTick % 10 === 0;
                    return (
                      <div key={yTick} className="flex items-center justify-end gap-2 my-2 h-4">
                        <span className={`${isDecade ? "text-[#eab308] font-bold" : "text-slate-600"}`}>
                          {yTick}
                        </span>
                        <span 
                          className={`h-0.5 bg-slate-900 ${
                            isDecade ? "w-3 bg-yellow-500/50" : "w-1.5 bg-slate-800"
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* 2. MAIN TIMELINE VERTICAL THREAD (RHS) */}
                <div className="relative border-l border-[#d4af37]/30 flex-1 pl-6 sm:pl-10 space-y-4 py-2 transition-all duration-300">
                  
                  {filteredMilestones.map((m, idx) => {
                    return (
                      <div 
                        key={idx} 
                        className="relative group transition-all duration-500"
                        style={{
                          marginBottom: `${Math.round(28 * timelineZoom)}px`,
                          transform: `scale(${0.96 + (timelineZoom * 0.02)})`,
                        }}
                      >
                        
                        {/* Glowing Ring Bullet on the timeline thread */}
                        <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full border border-[#d4af37] bg-slate-950 flex items-center justify-center transition-all duration-300 group-hover:bg-[#eab308] group-hover:scale-110 shadow">
                          <div className={`w-1.5 h-1.5 rounded-full ${m.isSubRecord ? "bg-cyan-500 group-hover:bg-cyan-300" : "bg-[#d4af37] group-hover:bg-black"}`} />
                        </div>

                        {/* Timeline card container */}
                        <div className={`bg-[#070b14]/90 p-5 sm:p-6 rounded-2xl shadow-xl transition-all duration-300 border ${
                          m.isSubRecord 
                            ? "border-cyan-500/10 hover:border-cyan-500/30 bg-[#040913]/60" 
                            : "border-slate-900 hover:border-[#eab308]/40 hover:shadow-yellow-500/5"
                        } hover:translate-x-1`}>
                          
                          {/* Header items */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className={`inline-block px-3 py-1 text-center font-cinzel font-black text-xs rounded shadow ${
                                m.isSubRecord 
                                  ? "bg-cyan-600 text-white" 
                                  : "bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-black"
                              }`}>
                                {m.year}
                              </span>
                              <div>
                                <h3 className="font-cinzel text-md font-bold text-slate-100 group-hover:text-yellow-500 transition-colors">
                                  {m.title}
                                </h3>
                                {m.isSubRecord && (
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-500">
                                    ✦ Intermediate Legacy Sub-Record
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Milestone category tag & Share button */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setShareItem({
                                    title: `${m.year}: ${m.title}`,
                                    description: m.description,
                                    type: m.isSubRecord ? "Tribute" : "Milestone"
                                  });
                                  setIsShareModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-slate-800 hover:border-yellow-500/30 text-slate-500 hover:text-yellow-500 text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                                id={`share-milestone-${idx}`}
                              >
                                <Share2 size={10} />
                                <span>Transmit</span>
                              </button>

                              <span className="inline-block text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded border border-slate-800 text-slate-500">
                                {m.category}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-slate-300 text-sm leading-relaxed mb-3 font-light">
                            {m.description}
                          </p>

                          {/* Deep detail expansion */}
                          {m.details && (
                            <div className="border-t border-slate-900/60 pt-3 mt-3">
                              <p className="text-slate-400 text-xs font-serif leading-relaxed italic">
                                💡 {m.details}
                              </p>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}

                </div>

              </div>

            </div>
          );
        })()}

        {/* TAB 3: DOCUMENT ARCHIVE & SPEECHES */}
        {activeTab === "documents" && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[#eab308] text-xs font-cinzel tracking-[0.3em] font-bold uppercase">Obiyingi Records Vault</span>
              <h2 className="font-cinzel text-3xl font-black">Historical Document Archive</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Review legal cases, structural addresses, ecclesiastical booklets, and prestigious awards documenting his service guidelines.
              </p>
            </div>

            {/* Document filtration bar */}
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-900 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search text field */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 text-slate-500 h-4.5 w-4.5" />
                <input
                  type="text"
                  placeholder="Search titles, speech indices..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="w-full bg-[#050811] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Tag Categories button selectors */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                {["All", "Legal", "Speeches", "Faith", "Awards"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedDocCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-semibold transition-all duration-300 ${
                      selectedDocCategory === cat 
                        ? "bg-[#eab308] text-black font-bold" 
                        : "bg-[#050811] border border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Documents catalog display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[#070b14] border border-slate-900 rounded-2xl p-6 transition-all duration-300 hover:border-[#eab308]/30 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#eab308]/15 text-[#eab308] font-cinzel text-[10px] font-bold uppercase tracking-wider">
                          <FileText size={10} /> {doc.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono italic">
                          {doc.date}
                        </span>
                      </div>

                      <h3 className="font-cinzel text-md font-bold text-slate-100 line-clamp-2">
                        {doc.title}
                      </h3>
                      
                      <p className="text-slate-400 text-xs font-light line-clamp-3 leading-relaxed">
                        {doc.summary}
                      </p>
                    </div>

                    <div className="border-t border-slate-900 mt-4 pt-4 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        📄 {doc.pages} Page Brief
                      </span>
                      
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="flex items-center gap-1 text-[11px] font-cinzel text-yellow-500 hover:text-[#d4af37] font-bold tracking-widest uppercase transition-all"
                      >
                        <Eye size={12} /> Read Archive
                      </button>
                    </div>

                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 text-center py-12 text-slate-500 font-serif">
                  🔍 No historical papers found matching the filters.
                </div>
              )}
            </div>

            {/* Parchment-style Document Viewer Overlay Container */}
            {selectedDoc && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-[#fbfcfa] text-[#1c1917] max-w-2xl w-full rounded-2xl shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col">
                  
                  {/* Parchment Header visual */}
                  <div className="bg-[#1c1917] text-[#f5f5f4] p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-[#d4af37]">Archive Record ID: {selectedDoc.id}</span>
                      <h4 className="font-cinzel text-md font-bold">{selectedDoc.title}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedDoc(null)}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Document Body simulating historic legal parchment */}
                  <div className="p-8 overflow-y-auto space-y-4 flex-grow bg-gradient-to-b from-[#fbfcfa] to-[#f4f3ef] leading-relaxed relative">
                    {/* Watermark Logo seal */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                      <Scale className="w-96 h-96" />
                    </div>

                    <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#854d0e] border-b border-[#a16207]/20 pb-2">
                      Obiyingi Chambers Historic Document Preservation Registry
                    </p>
                    
                    <div className="flex justify-between text-xs font-mono text-stone-500">
                      <span>DATE: {selectedDoc.date}</span>
                      <span>CATEGORY: {selectedDoc.category}</span>
                    </div>

                    <div className="h-0.5 bg-amber-800/20" />

                    <h5 className="font-cinzel text-lg font-bold border-l-2 border-amber-800 pl-3">
                      CERTIFIED EXTRACT:
                    </h5>

                    <p className="font-mono text-xs text-stone-800 whitespace-pre-wrap leading-relaxed tracking-wide bg-[#fafaf9] p-4 border border-stone-200/80 rounded-lg shadow-sm font-semibold">
                      {selectedDoc.previewText}...
                    </p>

                    <div className="text-[11px] text-stone-500 text-center font-serif pt-4 italic border-t border-stone-200">
                      "Ibeni Iwolo & Associates — Yenagoa Municipality Registry Office."
                    </div>

                  </div>

                  {/* Parchment actions */}
                  <div className="bg-stone-100 border-t border-stone-200 p-4 flex items-center justify-between">
                    <span className="text-xs text-stone-500 font-serif">Original Preserved in Okolobiri family files</span>
                    <button
                      onClick={() => {
                        alert("Preservation copy requested for local study. The system has exported this citation record to your system cache successfully.");
                        setSelectedDoc(null);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-cinzel tracking-wider uppercase rounded shadow hover:shadow-md transition-all font-bold"
                    >
                      <Download size={14} /> Download Citation
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: GUESTBOOK / MEMORIAL WALL */}
        {activeTab === "guestbook" && (
          <div className="space-y-12" id="guestbook-section">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-[#eab308] text-xs font-cinzel tracking-[0.3em] font-bold uppercase">Community Chronicles</span>
              <h2 className="font-cinzel text-3xl font-black">Digital Memorial Guestbook</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Offer your sincere condolences, record a testimony of his support, and ignite a digital flame of honoring remembrance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-5xl mx-auto">
              
              {/* Left Column: Register guest text */}
              <div className="lg:col-span-5 bg-[#070b14] border border-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-5 sticky top-28">
                
                <div className="space-y-1.5">
                  <h3 className="font-cinzel text-yellow-500 text-xs uppercase tracking-[0.15em] font-bold">Registry Form</h3>
                  <h4 className="font-playfair text-xl font-bold">Write Your Testimony</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Once submitted, your tribute message will immediately appear on the digital memorial wall catalog below.
                  </p>
                </div>

                {formError && (
                  <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-900/40 text-red-400 text-xs">
                    ⚠️ {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-950 text-emerald-300 text-xs flex items-center gap-2">
                    <Check size={14} className="text-emerald-400" /> Safe registry! Your message has been entered with honor.
                  </div>
                )}

                <form onSubmit={handleTributeSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Your Full Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#03060c] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      placeholder="e.g. Chief Tonye Okolobiri"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Relationship / Designation</label>
                    <input
                      type="text"
                      className="w-full bg-[#03060c] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      placeholder="e.g. Learned Magistrate / Family Friend"
                      value={formData.relation}
                      onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Registry Category</label>
                    <select
                      className="w-full bg-[#03060c] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="community">INC / Community Advocate</option>
                      <option value="colleague">Colleague in Law Practice</option>
                      <option value="church">Anglican Church Member</option>
                      <option value="family">Family & Kinsman Member</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Heartfelt Message</label>
                    <textarea
                      className="w-full bg-[#03060c] border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] min-h-[110px]"
                      placeholder="Share your testimonies or remembrance words representing Barrister's impact on your path..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      maxLength={1000}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingTribute}
                    className="w-full py-3 bg-gradient-to-r from-[#ca8a04] to-[#eab308] text-black font-cinzel font-bold text-xs uppercase tracking-widest rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    {submittingTribute ? "Preserving..." : "Publish to Memorial Wall"}
                  </button>
                </form>

              </div>

              {/* Right Column: Active tributes */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Visual selector filter for category */}
                <div className="flex flex-wrap gap-2 pb-3 border-b border-slate-900">
                  {[
                    { id: "all", label: "All Tributes" },
                    { id: "family", label: "Family" },
                    { id: "colleague", label: "Legal" },
                    { id: "church", label: "Faith" },
                    { id: "community", label: "Regional" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setTributeCategory(cat.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xxs font-semibold uppercase tracking-wider transition-all duration-300 ${
                        tributeCategory === cat.id 
                          ? "bg-[#eab308]/15 border border-[#eab308]/30 text-yellow-500" 
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {loadingTributes ? (
                  <div className="text-center py-12 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-500 mx-auto mb-2" />
                    <p className="font-serif">Opening registry manuscripts...</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {filteredTributes.map((trib) => (
                      <div
                        key={trib.id}
                        className="bg-[#070b14]/50 border border-slate-900/80 rounded-2xl p-6 transition-all duration-300 hover:border-[#eab308]/20 relative group"
                      >
                        {/* Memorial lit candle box */}
                        <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-[#ca8a04]/10 border border-[#ca8a04]/20 px-2.5 py-1 rounded-full text-xxs text-yellow-500">
                          <Flame size={12} className="text-yellow-500 candle-flicker" /> 
                          <span>{trib.candlesLit || 1} Flame Lit</span>
                        </div>

                        <div className="space-y-2 max-w-[85%]">
                          <h4 className="font-cinzel text-md text-slate-100 font-bold group-hover:text-[#eab308] transition-colors leading-tight">
                            {trib.name}
                          </h4>
                          <p className="text-[10px] uppercase text-stone-500 font-mono tracking-wider font-semibold">
                            👤 {trib.relation} • {trib.category.toUpperCase()}
                          </p>
                          <p className="text-slate-300 text-xs md:text-sm font-light leading-relaxed whitespace-pre-line border-t border-slate-900/60 pt-3 italic">
                            "{trib.message}"
                          </p>
                        </div>

                        {/* Interactive Spark: Click to light additional candle and Share */}
                        <div className="mt-4 pt-3 border-t border-slate-900/60 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 font-mono">
                            Registered on {trib.date}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setShareItem({
                                  title: `Honoring Tribute by ${trib.name}`,
                                  description: trib.message,
                                  type: "Tribute",
                                  author: trib.name
                                });
                                setIsShareModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 text-[10px] font-cinzel font-bold text-slate-400 hover:text-white hover:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition-all cursor-pointer"
                              id={`btn-share-tribute-${trib.id}`}
                              title="Share this tribute card"
                            >
                              <Share2 size={11} />
                              <span>Share</span>
                            </button>

                            <button
                              onClick={() => handleLightCandle(trib.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-cinzel font-bold text-yellow-500 hover:text-white hover:bg-[#eab308]/10 px-2.5 py-1 rounded-lg border border-[#eab308]/20 transition-all cursor-pointer"
                            >
                              🔥 Light Virtual Candle
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 5: GALLERY */}
        {activeTab === "gallery" && (
          <GallerySection />
        )}

      </main>

      {/* Dynamic Archival Share Modal */}
      <SocialShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        details={shareItem} 
      />

      {/* FIXED FLOATING WIDGET: CHATBOT BIO ASSISTANT */}
      <div className="fixed bottom-6 right-6 z-50">
        
        {/* Toggle bubble button */}
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#854d0e] via-[#ca8a04] to-[#eab308] text-black shadow-2xl flex items-center justify-center hover:scale-105 transition-all duration-300 relative group border border-amber-300/30"
            title="Ask Barrister's History Chatbot"
            id="btn-chatbot-open"
          >
            {/* Soft pulse effect */}
            <div className="absolute inset-x-0 inset-y-0 rounded-full bg-[#eab308]/20 animate-ping pointer-events-none" />
            <MessageSquare size={26} />
          </button>
        ) : (
          /* Beautiful Legal Assistant Panel Card */
          <div className="w-[360px] max-w-[calc(100vw-32px)] h-[500px] rounded-2xl bg-[#090d16] border border-[#d4af37]/30 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0c1322] to-[#121927] border-b border-[#d4af37]/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full border border-yellow-500/30 bg-[#050811] flex items-center justify-center text-yellow-500">
                  <Scale size={16} />
                </div>
                <div>
                  <h4 className="font-cinzel text-xs text-yellow-500 font-bold tracking-wider leading-none">Voice of Obiyingi</h4>
                  <span className="text-[9px] text-slate-400">Archival Guard & Memory</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded bg-[#03060c] hover:bg-slate-800 text-slate-400 hover:text-white"
                id="btn-chatbot-close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Discussion Screen thread */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gradient-to-b from-[#060a12] to-[#03060c]">
              
              {/* Default Welcome System Prompt */}
              <div className="bg-[#0b1324] border border-[#d4af37]/10 p-3 rounded-xl max-w-[90%] text-xs space-y-2">
                <p className="text-slate-300 font-serif leading-relaxed">
                  Greetings, seeker of historical truth. I represent the wisdom and papers of the Late Barrister Ibeni Iwolo. 
                  Ask me about his <strong>Obiyingi Chambers</strong>, <strong>Ijaw National Congress milestones</strong>, or <strong>church legacy</strong>.
                </p>
                <p className="text-[10px] text-[#eab308] italic">
                  "Truth is simple. Quiet strength leaves the deepest mark."
                </p>
              </div>

              {/* Chat Thread history mapped */}
              {chatHistory.map((turn, tIdx) => (
                <div
                  key={tIdx}
                  className={`flex ${turn.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-xl text-xs leading-relaxed ${
                      turn.role === "user"
                        ? "bg-[#eab308] text-black font-semibold rounded-br-none"
                        : "bg-[#0b1324]/80 border border-slate-900 text-slate-300 rounded-bl-none font-serif"
                    }`}
                  >
                    {turn.parts[0].text}
                  </div>
                </div>
              ))}

              {/* Loading thinking bubble */}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-950/60 p-3.5 rounded-xl rounded-bl-none text-xs text-slate-400 flex items-center gap-1.5 font-serif italic border border-slate-900">
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce" />
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="h-1.5 w-1.5 bg-yellow-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span>Searching Okolobiri legal files...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Quick pre-filled option selector pills */}
            <div className="px-4 py-2 bg-[#050812] border-t border-slate-900 flex whitespace-nowrap overflow-x-auto gap-2 no-scrollbar">
              {chatPills.map((p, i) => (
                <button
                  key={i}
                  className="px-2.5 py-1 text-[9px] font-mono text-slate-400 hover:text-white bg-[#03060c] border border-slate-800 rounded-full transition-all flex-shrink-0 cursor-pointer"
                  onClick={() => setChatMessage(p)}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Submit field form */}
            <form onSubmit={handleChatSend} className="p-3 bg-slate-950 border-t border-slate-900 flex gap-2">
              <input
                type="text"
                placeholder="Ask representing his achievements..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-grow bg-[#050811] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                required
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#eab308] hover:bg-[#ca8a04] text-black transition-all"
              >
                <Send size={14} />
              </button>
            </form>

          </div>
        )}

      </div>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#020409] border-t border-yellow-600/15 py-12 px-4 md:px-8 relative z-30 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          
          <div className="md:col-span-5 space-y-3">
            <h4 className="font-cinzel text-[#eab308] text-sm tracking-wider font-bold">Late Barrister Ibeni Iwolo</h4>
            <p className="font-serif leading-relaxed text-slate-400">
              A monumental digital preserve celebrating a lifetime of legal integrity, ecclesiastical dedication to the Diocese of Niger Delta West, 
              statesmanship under the Ijaw National Congress, and grassroots aquaculture training in Bayelsa State.
            </p>
            <p className="text-[#ca8a04] font-semibold italic text-xxs font-cinzel">
              "His path remains a lantern on the creeks."
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="font-cinzel text-[#eab308] text-sm tracking-wider font-bold">Chronicle Indexes</h4>
            <ul className="space-y-2 font-mono">
              <li>
                <button onClick={() => { setActiveTab("bio"); setSelectedChapter("early"); }} className="hover:text-yellow-500 text-slate-400">
                  ↪ Okolobiri Early Foundations
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("bio"); setSelectedChapter("legal"); }} className="hover:text-yellow-500 text-slate-400">
                  ↪ Obiyingi Chambers History
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("bio"); setSelectedChapter("community"); }} className="hover:text-yellow-500 text-slate-400">
                  ↪ INC Statesman Mediation
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("bio"); setSelectedChapter("faith"); }} className="hover:text-yellow-500 text-slate-400">
                  ↪ Ecclesiastical Canon Guidelines
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-cinzel text-[#eab308] text-sm tracking-wider font-bold">Preservation Acknowledgement</h4>
            <p className="text-slate-500 font-serif leading-relaxed">
              Maintained under the authority of the Iwolo Trust and the legal heirs & partners of Obiyingi Chambers. Contact Yenagoa municipal registrars for original parchment review permissions.
            </p>
            <div className="text-[10px] text-stone-500 font-mono">
              Yenagoa & Okolobiri Local Communities, Bayelsa • 2026 Year of Remembrance
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 font-mono">
          <span>&copy; {new Date().getFullYear()} The Late Barrister Ibeni Iwolo Trust. All Rights Preserved.</span>
          <span className="text-[10px]">
            Designed with cinematic integrity & quiet depth
          </span>
        </div>
      </footer>

    </div>
  );
}
