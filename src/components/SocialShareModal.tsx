import React, { useState } from "react";
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Twitter, 
  Facebook, 
  MessageSquare, 
  Download, 
  ExternalLink,
  Sparkles,
  Link,
  Milestone,
  FileText
} from "lucide-react";

export interface ShareDetails {
  title: string;
  description: string;
  type: "Tribute" | "Milestone";
  author?: string;
}

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  details: ShareDetails | null;
}

export default function SocialShareModal({ isOpen, onClose, details }: SocialShareModalProps) {
  if (!isOpen || !details) return null;

  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Parse location protocol and headers to build the share URL
  const getShareUrl = () => {
    const base = window.location.origin;
    const typeQuery = details.type.toLowerCase();
    const encTitle = encodeURIComponent(details.title);
    const encDesc = encodeURIComponent(details.description);
    const encAuthor = encodeURIComponent(details.author || "");
    const encType = encodeURIComponent(details.type.toUpperCase());

    // Generate link carrying dynamic OG tags that our server parses
    return `${base}/?tab=${typeQuery === "tribute" ? "guestbook" : "timeline"}&share_title=${encTitle}&share_desc=${encDesc}&share_type=${encType}&share_author=${encAuthor}`;
  };

  const getOgImageApiUrl = () => {
    const base = window.location.origin;
    const encTitle = encodeURIComponent(details.title);
    const encDesc = encodeURIComponent(details.description);
    const encType = encodeURIComponent(details.type.toUpperCase());
    const encAuthor = encodeURIComponent(details.author || "");

    return `${base}/api/og/image?title=${encTitle}&desc=${encDesc}&type=${encType}&author=${encAuthor}`;
  };

  const shareUrl = getShareUrl();
  const ogImageUrl = getOgImageApiUrl();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyText = () => {
    const message = `"${details.title}"\n\n${details.description}\n\nRead more & celebrate the legacy of Barrister Ibeni Iwolo here: ${shareUrl}`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${details.type}: ${details.title}`,
          text: details.description,
          url: shareUrl
        });
      } catch (err) {
        console.warn("User cancelled or share api error:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const downloadSvgImage = async () => {
    try {
      const response = await fetch(ogImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `og_memorial_print_${details.type.toLowerCase()}_${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download dynamic share image:", err);
      alert("Opening vector print in new tab instead.");
      window.open(ogImageUrl, "_blank");
    }
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${details.title}"\n\nCelebrate the legal and historical legacy of Barrister Ibeni Iwolo:`)}&url=${encodeURIComponent(shareUrl)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`"${details.title}"\n\n${details.description}\n\nLearn more at: ${shareUrl}`)}`;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#050811] border border-yellow-600/30 max-w-2xl w-full rounded-2xl shadow-2xl relative overflow-hidden flex flex-col p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in text-slate-100">
        
        {/* CLOSE CONTROL */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
          title="Close dialog"
        >
          <X size={16} />
        </button>

        {/* HEADER SECTION */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center gap-1.5 text-xs font-cinzel text-yellow-500 font-bold uppercase tracking-widest">
            <Share2 size={13} /> Archival Transmission
          </div>
          <h2 className="font-cinzel text-xl font-bold tracking-wide">
            Share {details.type}
          </h2>
          <p className="text-xs text-slate-400 font-serif leading-relaxed">
            Generate and broadcast this dynamic memorial record to your professional and community networks.
          </p>
        </div>

        {/* OPEN GRAPH CARDS LIVE PREVIEW BOX */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1 font-bold">
              <Sparkles size={11} className="text-yellow-500" /> Server-side Live OG Image preview
            </span>
            <span className="text-yellow-500/80">1200 x 630 Vector Aspect</span>
          </div>
          
          <div className="relative aspect-[1200/630] w-full rounded-xl overflow-hidden border border-slate-900 bg-slate-950 shadow-inner group">
            <div className="absolute inset-0 bg-slate-950 flex items-center justify-center -z-10">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="w-8 h-8 rounded-full border-t-2 border-yellow-500 animate-spin" />
                <span className="text-[10px] font-serif text-slate-500 italic">Generating authentic chemical dye...</span>
              </div>
            </div>
            
            <img 
              src={ogImageUrl} 
              alt="Live Open Graph Render" 
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              onLoad={(e) => {
                const target = e.currentTarget;
                target.style.opacity = "1";
              }}
              style={{ transition: "opacity 0.5s ease" }}
            />
          </div>
        </div>

        {/* METADATA INSPECT CARD */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-900 space-y-2">
          <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1">
            {details.type === "Milestone" ? <Milestone size={11} className="text-amber-500" /> : <FileText size={11} className="text-amber-500" />}
            Extracted Archive Item Card Data
          </div>
          <p className="text-[11px] font-mono leading-relaxed text-yellow-500/90 italic font-bold">
            "{details.title}"
          </p>
          <p className="text-xs font-serif leading-relaxed text-slate-400 line-clamp-2">
            {details.description}
          </p>
        </div>

        {/* DISTRIBUTION TRIGGERS BOX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          
          {/* Action Col 1: Direct link tools */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Hyperlink Tools</p>
            
            <button
              onClick={handleCopyLink}
              className="w-full py-2.5 px-3 rounded-lg border border-slate-900 bg-[#03060c] hover:bg-slate-900 text-xs flex items-center justify-between text-slate-200 transition-all font-semibold cursor-pointer"
              id="btn-share-copy-link"
            >
              <span className="flex items-center gap-2">
                <Link size={13} className="text-yellow-500" /> Copy Shareable URL
              </span>
              {copiedLink ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-500" />}
            </button>

            <button
              onClick={handleCopyText}
              className="w-full py-2.5 px-3 rounded-lg border border-slate-900 bg-[#03060c] hover:bg-slate-900 text-xs flex items-center justify-between text-slate-200 transition-all font-semibold cursor-pointer"
              id="btn-share-copy-text"
            >
              <span className="flex items-center gap-2">
                <FileText size={13} className="text-yellow-500" /> Copy Quote &amp; Link
              </span>
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="text-slate-500" />}
            </button>
          </div>

          {/* Action Col 2: Action redirects */}
          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">Action Broadcast</p>
            
            <div className="grid grid-cols-3 gap-2">
              <a
                href={tweetUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 rounded-lg border border-slate-900 bg-[#03060c] hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-[10px] tracking-wider text-slate-300 font-bold transition hover:text-[#1da1f2]"
                title="Post to Twitter / X"
                id="link-share-twitter"
              >
                <Twitter size={14} />
                <span>X / TW</span>
              </a>

              <a
                href={fbUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 rounded-lg border border-slate-900 bg-[#03060c] hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-[10px] tracking-wider text-slate-300 font-bold transition hover:text-[#1877f2]"
                title="Post to Facebook"
                id="link-share-facebook"
              >
                <Facebook size={14} />
                <span>FB</span>
              </a>

              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 rounded-lg border border-slate-900 bg-[#03060c] hover:bg-slate-900 flex flex-col items-center justify-center gap-1 text-[10px] tracking-wider text-slate-300 font-bold transition hover:text-[#25d366]"
                title="Send via WhatsApp"
                id="link-share-whatsapp"
              >
                <MessageSquare size={14} />
                <span>WA</span>
              </a>
            </div>

            {navigator.share ? (
              <button
                onClick={handleNativeShare}
                className="w-full py-2 bg-yellow-500/10 hover:bg-yellow-500/15 border border-yellow-500/20 text-yellow-500 hover:text-yellow-400 font-cinzel font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                id="btn-share-native"
              >
                <Share2 size={11} /> Launch Device Share Sheet
              </button>
            ) : null}

          </div>

        </div>

        {/* BOTTOM DOWNLOAD ACCESS OR SIGNATURE */}
        <div className="pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/20 -mx-6 -mb-6 p-6">
          <span className="text-[10px] font-mono text-slate-500">
            * Dynamic PNGs use vectors rendered natively in real-time.
          </span>
          <button
            onClick={downloadSvgImage}
            className="px-4 py-2 bg-gradient-to-r from-[#ca8a04] to-[#eab308] hover:to-[#eab308]/90 text-black font-cinzel font-bold text-[10px] uppercase tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
            id="btn-share-download-card"
          >
            <Download size={12} /> Download OG Card (.SVG)
          </button>
        </div>

      </div>
    </div>
  );
}
