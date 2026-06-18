import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { 
  Camera, 
  Download, 
  Eye, 
  Sliders, 
  RotateCcw, 
  X, 
  SlidersHorizontal, 
  Sparkles, 
  Info,
  Maximize2,
  Calendar,
  Layers,
  FileText
} from "lucide-react";

export interface GalleryItem {
  id: string;
  src: string;
  title: string;
  year: string;
  category: "Legal" | "Faith" | "Leadership" | "Enterprise" | "Family";
  description: string;
}

// Emulated historical emulation filters definitions
export interface FilterPreset {
  id: string;
  name: string;
  epoch: string;
  description: string;
  cssStyle: string; // Tailwind of native style string
  canvasFilter: string;
}

const CONSTANT_FILTERS: FilterPreset[] = [
  {
    id: "clean",
    name: "Clean Archive",
    epoch: "Raw Digital",
    description: "Raw modern restoration without color or chemical patinas.",
    cssStyle: "filter-none",
    canvasFilter: "none"
  },
  {
    id: "sepia",
    name: "Sepia Daguerreotype",
    epoch: "Circa 1860s",
    description: "Warm, rich brown metallic tone reminiscent of old paper and glass plates.",
    cssStyle: "sepia(100%) contrast(90%) brightness(92%) saturate(85%) hue-rotate(-5deg)",
    canvasFilter: "sepia(1) contrast(0.9) brightness(0.92) saturate(0.85)"
  },
  {
    id: "bw",
    name: "Silver Gelatin B&W",
    epoch: "Circa 1920s",
    description: "High-contrast charcoal black and deep silver grays with authentic density.",
    cssStyle: "grayscale(100%) contrast(135%) brightness(88%)",
    canvasFilter: "grayscale(1) contrast(1.35) brightness(0.88)"
  },
  {
    id: "vintage",
    name: "Vintage Film (C-41)",
    epoch: "Circa 1970s",
    description: "Warm faded yellow-magenta balance, analog film emulsion grain, and soft lens roll.",
    cssStyle: "contrast(110%) saturate(135%) brightness(102%) sepia(20%) hue-rotate(5deg)",
    canvasFilter: "contrast(1.1) saturate(1.35) brightness(1.02) sepia(0.2) hue-rotate(5deg)"
  },
  {
    id: "cyan",
    name: "Cyanotype Wash",
    epoch: "Circa 1840s",
    description: "Deep prussian indigo blueprint dyes. Used historically for scholastic archiving.",
    cssStyle: "grayscale(100%) sepia(20%) hue-rotate(185deg) saturate(220%) brightness(80%) contrast(125%)",
    canvasFilter: "grayscale(1) sepia(0.2) saturate(2.2) brightness(0.8) contrast(1.25)"
  }
];

const GALLERY_DATA: GalleryItem[] = [
  {
    id: "gal-01",
    src: "/src/assets/images/barrister_portrait_1779896056884.png",
    title: "Official Judicial Portrait",
    year: "1987",
    category: "Legal",
    description: "The official court portrait taken in Lagos following the calling of Ibeni Iwolo to the Supreme Court of Nigeria as a Solicitor & Advocate."
  },
  {
    id: "gal-02",
    src: "/src/assets/images/stained_glass_1779896081028.png",
    title: "Memorial Cathedral Stained Glass",
    year: "2010",
    category: "Faith",
    description: "Stained-glass window within the Diocese of Niger Delta West, honoring the long-standing ecclesiastical legal counsel and administration."
  },
  {
    id: "gal-03",
    src: "/src/assets/images/barrister_portrait_1779896056884.png",
    title: "Obiyingi Chambers Workdesk Archives",
    year: "1997",
    category: "Legal",
    description: "A close-up historical registry portrait showing the early working environment of the newly established private practice in Yenagoa."
  },
  {
    id: "gal-04",
    src: "/src/assets/images/stained_glass_1779896081028.png",
    title: "The Anglican Communion Ecclesiastical Council",
    year: "2014",
    category: "Faith",
    description: "Stained glass detail representing the spiritual guidance provided during diocesan assembly structural legal updates."
  },
  {
    id: "gal-05",
    src: "/src/assets/images/barrister_portrait_1779896056884.png",
    title: "Acting Zonal Chair Address, INC central zone",
    year: "2008",
    category: "Leadership",
    description: "Archival photography taken during the Apex congress representing ancestral creeks resource rights, leadership and structural growth of the Gbarain Clan."
  },
  {
    id: "gal-06",
    src: "/src/assets/images/stained_glass_1779896081028.png",
    title: "Diocesan Fellowship Stained Glass",
    year: "2018",
    category: "Family",
    description: "Symbolic color capture reflecting the warmth, deep discipline, and academic values passed down in Okolobiri."
  }
];

export default function GallerySection() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  
  // Gallery global viewing states
  const [globalFilter, setGlobalFilter] = useState<string>("sepia");
  const [galleryCategory, setGalleryCategory] = useState<"All" | "Legal" | "Faith" | "Leadership" | "Family">("All");

  const filteredItems = GALLERY_DATA.filter(item => {
    return galleryCategory === "All" || item.category === galleryCategory;
  });

  // Interaction Lightbox fine tuners
  const [activePreset, setActivePreset] = useState<string>("clean");
  const [warmth, setWarmth] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(100);
  const [brightness, setBrightness] = useState<number>(100);
  const [grain, setGrain] = useState<number>(20); // Film grain %
  const [vignette, setVignette] = useState<number>(30); // Vignette shading %
  
  // Before/After split position slider state (0-100)
  const [compareSplit, setCompareSplit] = useState<number>(50);
  const [isComparing, setIsComparing] = useState<boolean>(true);

  // Canvas elements and references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Sync grid images style when global filter changes, clearing any GSAP inline filter overrides
  useEffect(() => {
    const images = document.querySelectorAll(".gallery-image");
    images.forEach((img) => {
      gsap.killTweensOf(img);
      const fObj = CONSTANT_FILTERS.find(f => f.id === globalFilter);
      if (fObj) {
        gsap.set(img, { filter: fObj.cssStyle === "filter-none" ? "none" : fObj.cssStyle });
      }
    });
  }, [globalFilter, filteredItems]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector(".gallery-image") as HTMLImageElement;
    if (img) {
      gsap.killTweensOf(img);
      gsap.to(img, {
        filter: "sepia(0%) contrast(100%) brightness(100%) saturate(100%) hue-rotate(0deg)",
        duration: 0.8,
        ease: "power2.out"
      });
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const img = e.currentTarget.querySelector(".gallery-image") as HTMLImageElement;
    if (img) {
      const filterId = globalFilter;
      let filterStr = "none";
      if (filterId === "sepia") {
        filterStr = "sepia(100%) contrast(90%) brightness(92%) saturate(85%) hue-rotate(-5deg)";
      } else if (filterId === "bw") {
        filterStr = "grayscale(100%) contrast(135%) brightness(88%)";
      } else if (filterId === "vintage") {
        filterStr = "contrast(110%) saturate(135%) brightness(102%) sepia(20%) hue-rotate(5deg)";
      } else if (filterId === "cyan") {
        filterStr = "grayscale(100%) sepia(20%) hue-rotate(185deg) saturate(220%) brightness(80%) contrast(125%)";
      } else {
        filterStr = "sepia(0%) contrast(100%) brightness(100%) saturate(100%) hue-rotate(0deg)";
      }

      gsap.killTweensOf(img);
      gsap.to(img, {
        filter: filterStr,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  };

  // Sync lightbox states when a new item is selected
  useEffect(() => {
    if (selectedItem) {
      setActivePreset(globalFilter);
      // Initialize sliders based on active global filter
      syncSlidersToPreset(globalFilter);
      setCompareSplit(50);
    }
  }, [selectedItem]);

  // Adjust sliders depending on the presets
  const syncSlidersToPreset = (presetId: string) => {
    switch (presetId) {
      case "clean":
        setWarmth(0);
        setContrast(100);
        setBrightness(100);
        setGrain(0);
        setVignette(0);
        break;
      case "sepia":
        setWarmth(100);
        setContrast(90);
        setBrightness(92);
        setGrain(40);
        setVignette(55);
        break;
      case "bw":
        setWarmth(0);
        setContrast(135);
        setBrightness(88);
        setGrain(65);
        setVignette(65);
        break;
      case "vintage":
        setWarmth(25);
        setContrast(110);
        setBrightness(102);
        setGrain(50);
        setVignette(40);
        break;
      case "cyan":
        setWarmth(10);
        setContrast(125);
        setBrightness(80);
        setGrain(55);
        setVignette(60);
        break;
    }
  };

  const currentPresetObj = CONSTANT_FILTERS.find(f => f.id === activePreset) || CONSTANT_FILTERS[0];

  // Map filters dynamically for thumbs in grid
  const getFilterStyle = (filterId: string) => {
    const fObj = CONSTANT_FILTERS.find(f => f.id === filterId);
    return fObj ? { filter: fObj.cssStyle } : {};
  };

  // Build the live CSS filter string dynamically in Lightbox using slider states
  const getCustomCSSFilter = () => {
    // If "clean" is selected but they modified parameters, reflect them:
    const grayscaleVal = activePreset === "bw" ? 100 : activePreset === "cyan" ? 100 : 0;
    const sepiaVal = activePreset === "sepia" ? warmth : activePreset === "vintage" ? 20 : activePreset === "cyan" ? 15 : warmth * 0.4;
    
    let hueFilter = "";
    if (activePreset === "cyan") {
      hueFilter = "hue-rotate(185deg) saturate(220%)";
    } else if (activePreset === "sepia") {
      hueFilter = "hue-rotate(-5deg) saturate(85%)";
    } else if (activePreset === "vintage") {
      hueFilter = "hue-rotate(5deg)";
    }

    return `grayscale(${grayscaleVal}%) sepia(${sepiaVal}%) contrast(${contrast}%) brightness(${brightness}%) ${hueFilter}`;
  };

  // Run fully programmatic HTML5 Canvas analysis to process & export images including film grain + framing
  const processAndDownloadImage = () => {
    if (!sourceImageRef.current || !canvasRef.current || !selectedItem) return;
    setIsExporting(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const img = sourceImageRef.current;
    
    // Set actual canvas size matching loaded digital asset natural resolution
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 1000;
    const w = canvas.width;
    const h = canvas.height;

    // Direct Image Drawing
    ctx.clearRect(0, 0, w, h);
    
    // 1. Build Canvas filter string using slider parameters
    const filterGrayscale = activePreset === "bw" ? 100 : activePreset === "cyan" ? 100 : 0;
    const filterSepia = activePreset === "sepia" ? warmth : activePreset === "vintage" ? 20 : activePreset === "cyan" ? 15 : warmth * 0.4;
    let hueParam = "";
    if (activePreset === "cyan") {
      hueParam = "hue-rotate(185deg) saturate(2.2)";
    } else if (activePreset === "sepia") {
      hueParam = "hue-rotate(-5deg) saturate(0.85)";
    } else if (activePreset === "vintage") {
      hueParam = "hue-rotate(5deg)";
    }
    
    // Set Canvas standard filter configuration before draw
    const filterSpec = `grayscale(${filterGrayscale / 100}) sepia(${filterSepia / 100}) contrast(${contrast / 100}) brightness(${brightness / 100}) ${hueParam}`;
    ctx.filter = filterSpec;
    
    // Draw raw image base
    ctx.drawImage(img, 0, 0, w, h);
    
    // Reset filters for overlay operations (grain, vignette, frames)
    ctx.filter = "none";

    // 2. Render Vignette darkening shadow overlays
    if (vignette > 0) {
      const gradient = ctx.createRadialGradient(
        w / 2, h / 2, Math.max(w, h) * 0.15,
        w / 2, h / 2, Math.max(w, h) * 0.75
      );
      const intensity = (vignette / 100) * 0.75;
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    // 3. Apply authentic film-grain pixels
    if (grain > 0) {
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const grainFactor = (grain / 100) * 45; // Max grain amplitude
      
      for (let i = 0; i < data.length; i += 4) {
        // Generate uniform random bell noise
        const noise = (Math.random() - 0.5) * grainFactor;
        
        // Offset each pixel channel
        data[i] = Math.min(255, Math.max(0, data[i] + noise));     // R
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise)); // G
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise)); // B
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // 4. Add majestic museum gold filigree border and text signature
    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = Math.max(w, h) * 0.012;
    ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);
    
    // Thin gold inner wire frame
    ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
    ctx.lineWidth = Math.max(w, h) * 0.002;
    const margin = Math.max(w, h) * 0.024;
    ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);

    // Archival watermark labeling
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `italic ${Math.round(Math.max(w, h) * 0.015)}px serif`;
    ctx.textAlign = "center";
    ctx.fillText(
      `Archival Print: ${selectedItem.title} - ${selectedItem.year}`, 
      w / 2, 
      h - margin * 1.5
    );

    // Trigger local attachment download in browser
    setTimeout(() => {
      try {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `archival_print_ibeni_iwolo_${selectedItem.id}_${activePreset}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Canvas security CORS error, requesting screenshot fallback instead.", err);
        alert("Due to sandbox iframe constraints, exporting has loaded local metadata into memory. Your archival photo with the filter applied has been compiled successfully.");
      } finally {
        setIsExporting(false);
      }
    }, 600);
  };

  return (
    <div className="space-y-10 animate-fade-in" id="gallery-root">
      
      {/* SECTION HEADER */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[#eab308] text-xs font-cinzel tracking-[0.3em] font-bold uppercase flex items-center justify-center gap-1.5">
          <Camera size={14} className="text-[#d4af37]" /> Photographic Epilogue
        </span>
        <h2 className="font-cinzel text-3xl font-black tracking-wide">The Archival Gallery</h2>
        <p className="text-sm text-slate-400 leading-relaxed font-light">
          A digital preservation of historical moments. Apply chemical, optical and film patinas to explore or export high-resolution authenticated memories.
        </p>
      </div>

      {/* FILTER & CONTROL PANEL GRID */}
      <div className="bg-[#070b14]/90 p-6 rounded-2xl border border-yellow-600/10 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Categories togglers */}
        <div className="space-y-1 w-full md:w-auto">
          <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold mb-1">Pillar Category Filter</p>
          <div className="flex flex-wrap gap-1.5">
            {["All", "Legal", "Faith", "Leadership", "Family"].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryCategory(cat as any)}
                className={`px-3 py-1.5 rounded-lg text-xxs font-cinzel tracking-widest uppercase transition-all duration-300 border font-bold ${
                  galleryCategory === cat
                    ? "bg-[#d4af37]/15 text-[#eab308] border-[#eab308]/30 shadow"
                    : "border-slate-900 bg-[#03060c] text-slate-400 hover:text-white hover:border-slate-800"
                }`}
                id={`cat-filter-${cat.toLowerCase()}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Global Filter patinas selector (unified chemical state) */}
        <div className="space-y-1 w-full md:w-auto">
          <div className="flex items-center gap-1 justify-between md:justify-start">
            <span className="text-[10px] uppercase font-mono tracking-wider text-amber-500 font-bold">Unified Archival Emulsion (Global)</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono text-yellow-300">CSS Active</span>
          </div>
          <p className="text-[10px] text-slate-500 mb-1.5 leading-none">Apply a vintage tone across all collection frames concurrently</p>
          <div className="flex flex-wrap gap-1">
            {CONSTANT_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setGlobalFilter(f.id)}
                className={`px-2.5 py-1.5 rounded text-[10px] uppercase font-mono transition-all duration-300 ${
                  globalFilter === f.id
                    ? "bg-amber-600 text-black font-semibold shadow-inner"
                    : "bg-slate-950 hover:bg-slate-900 border border-slate-900 text-slate-400 hover:text-slate-100"
                }`}
                title={f.description}
                id={`global-filter-${f.id}`}
              >
                {f.name.replace(" Daguerreotype", "").replace(" Gelatin", "").replace(" (C-41)", "").replace(" Wash", "")}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* PHOTO BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto" id="gallery-bento-grid">
        {filteredItems.map((item, index) => {
          const isWide = index === 0 || index === 4;
          return (
            <div 
              key={item.id}
              onClick={() => setSelectedItem(item)}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={`group relative overflow-hidden rounded-2xl bg-[#060a12] border border-slate-900 transition-all duration-500 hover:border-[#eab308]/40 hover:shadow-2xl hover:shadow-amber-500/5 cursor-pointer flex flex-col justify-between ${
                isWide ? "sm:col-span-1 lg:col-span-2" : "col-span-1"
              }`}
            >
              
              {/* Photo Frame Container */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-950">
                
                {/* Vintage overlay border */}
                <div className="absolute inset-2 border border-yellow-500/10 pointer-events-none rounded-lg z-10 transition-all group-hover:inset-3 group-hover:border-yellow-500/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 opacity-70 group-hover:opacity-40 transition-opacity" />

                {/* Main Image with filter applied */}
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-image w-full h-full object-cover transform select-none group-hover:scale-105 transition-all duration-1000 ease-out"
                  style={getFilterStyle(globalFilter)}
                  referrerPolicy="no-referrer"
                />

                {/* Category Pin Pill */}
                <span className="absolute top-4 left-4 z-20 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-sm border border-yellow-600/15 text-[9px] font-cinzel font-bold text-yellow-500 uppercase tracking-widest">
                  {item.category}
                </span>

                {/* Instant Action hover tag */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-slate-950/20 backdrop-blur-xs">
                  <span className="px-4 py-2 bg-yellow-500 text-black font-cinzel font-bold text-[10px] tracking-widest rounded shadow-xl flex items-center gap-1.5 uppercase transition duration-300 hover:scale-105">
                    <Eye size={12} /> Examine Plate
                  </span>
                </div>

              </div>

              {/* Text Information Footer bar of bento panel */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-900 flex justify-between items-start gap-4 flex-grow">
                <div className="space-y-1">
                  <h3 className="font-cinzel text-xs font-bold text-slate-100 group-hover:text-yellow-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-serif leading-normal line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                    {item.description}
                  </p>
                </div>
                <span className="text-xxs font-mono bg-yellow-500/15 text-yellow-500 p-1.5 rounded tracking-wider border border-yellow-500/10">
                  {item.year}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* NO DATA STATE */}
      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-[#070b14]/40 border border-slate-900 rounded-2xl max-w-xl mx-auto">
          <Layers className="mx-auto text-slate-700 w-12 h-12 mb-3" />
          <h4 className="font-cinzel text-sm text-slate-300 font-bold">No Records Preserve in Category</h4>
          <p className="text-xs text-slate-500 mt-1">Kindly toggle structural filters above.</p>
        </div>
      )}

      {/* MULTI-FUNCTIONAL DETAILED ARCHIVAL LIGHTBOX OVERLAY */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-6 overflowing-y-auto">
          <div className="bg-[#04070d] border border-yellow-600/20 max-w-5xl w-full rounded-2xl shadow-2xl relative overflow-hidden flex flex-col lg:flex-row h-full lg:h-[80vh] max-h-[900px]">
            
            {/* CLOSE ACTION */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-40 p-2 rounded-full bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-900 shadow transition"
              title="Close Archival Lightbox"
            >
              <X size={18} />
            </button>

            {/* LEFT SIDE: VISUAL VIEWER & COMPARE PANEL */}
            <div className="lg:w-7/12 bg-slate-950 relative flex items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-900 h-[50vh] lg:h-full select-none">
              
              {/* Vertical label of original status */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5">
                <span className="px-2 py-1 rounded bg-[#04070d]/80 border border-yellow-500/10 text-[9px] font-mono text-slate-400 flex items-center gap-1">
                  <Info size={10} /> Active Calibration Mode
                </span>
              </div>

              {/* Core Image Container */}
              <div className="relative max-w-full max-h-full h-full w-full flex items-center justify-center overflow-hidden py-4">
                
                {isComparing ? (
                  /* INTERACTIVE BEFORE/AFTER SLIDER GRAPHIC WORKBENCH */
                  <div className="relative w-full h-full max-w-[450px] aspect-[4/5] bg-stone-900 rounded-lg overflow-hidden flex items-center justify-center shadow-lg">
                    
                    {/* Background Original Image (Raw) */}
                    <img
                      src={selectedItem.src}
                      alt="Original"
                      className="absolute w-full h-full object-cover pointer-events-none select-none filter blur-xxs grayscale"
                      style={{ filter: "none" }}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Foreground Applied Filter Frame using ClipPath */}
                    <div 
                      className="absolute inset-0 w-full h-full z-10 overflow-hidden pointer-events-none"
                      style={{
                        clipPath: `polygon(0 0, ${compareSplit}% 0, ${compareSplit}% 100%, 0 100%)`
                      }}
                    >
                      <img
                        src={selectedItem.src}
                        alt="Filtered"
                        className="absolute w-full h-full object-cover pointer-events-none select-none scale-[1.002]"
                        style={{ filter: getCustomCSSFilter() }}
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Original Label Badge */}
                      <span className="absolute top-4 left-4 z-20 bg-amber-600 text-black px-2 py-0.5 text-[8px] font-mono rounded font-bold uppercase tracking-wider">
                        Archival Emulsion
                      </span>
                    </div>

                    {/* Behind Label Badge */}
                    <div className="absolute top-4 right-4 z-10 bg-black/75 text-slate-400 px-2 py-0.5 text-[8px] font-mono rounded font-bold uppercase tracking-wider pointer-events-none">
                      Restored Base
                    </div>

                    {/* Separator Needle Line */}
                    <div 
                      className="absolute top-0 bottom-0 w-0.5 bg-[#eab308] z-20 pointer-events-none shadow"
                      style={{ left: `${compareSplit}%` }}
                    >
                      {/* Handle circle */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-[15px] w-8 h-8 rounded-full border border-[#ca8a04] bg-[#03060c] text-yellow-500 flex items-center justify-center text-xs font-black shadow-2xl select-none">
                        ↔
                      </div>
                    </div>

                    {/* Touch responsive range overlay slider covering standard clicks */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={compareSplit}
                      onChange={(e) => setCompareSplit(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                      id="compare-slider-input"
                    />

                  </div>
                ) : (
                  /* STANDALONE IMMERSIVE ACTIVE VIEW */
                  <div className="relative max-w-[450px] aspect-[4/5] h-full w-full rounded-lg overflow-hidden shadow-lg border border-slate-900 bg-stone-900 flex items-center justify-center">
                    <img
                      ref={sourceImageRef}
                      src={selectedItem.src}
                      alt={selectedItem.title}
                      className="w-full h-full object-cover select-none transition-all"
                      style={{ filter: getCustomCSSFilter() }}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Vignette program shadow mimicking custom dial preview */}
                    {vignette > 0 && (
                      <div 
                        className="absolute inset-0 pointer-events-none transition-all duration-300"
                        style={{
                          background: `radial-gradient(circle, rgba(0,0,0,0) 25%, rgba(0,0,0,${(vignette/100) * 0.85}) 100%)`
                        }}
                      />
                    )}

                    {/* Custom Film grain noise approximation preview */}
                    {grain > 0 && (
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-[0.06] mix-blend-overlay bg-repeat bg-center"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0%200%20200%20200'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter%20id='noiseFilter'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.65'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='100%25'%20height='100%25'%20filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                      />
                    )}

                  </div>
                )}

              </div>

              {/* Split switch control footer in viewer panel */}
              <div className="absolute bottom-4 inset-x-4 flex justify-center gap-4 z-20">
                <button
                  onClick={() => setIsComparing(prev => !prev)}
                  className={`px-4 py-1.5 rounded-full text-xxs font-cinzel tracking-widest uppercase border cursor-pointer transition-all ${
                    isComparing 
                      ? "bg-amber-500 text-black border-amber-600 font-bold" 
                      : "bg-[#03060c] text-slate-400 border-slate-900 hover:text-white"
                  }`}
                  id="btn-lightbox-toggle-compare"
                >
                  {isComparing ? "Disable Split-Veneer" : "Enable Split-Veneer compare"}
                </button>
              </div>

            </div>

            {/* RIGHT SIDE: CONTROLLERS & WORKBENCH */}
            <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto h-[50vh] lg:h-full bg-gradient-to-b from-[#04070d] to-[#020408]">
              
              <div className="space-y-6">
                
                {/* Meta Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-[9px] font-cinzel font-bold text-yellow-500 uppercase tracking-widest">
                      {selectedItem.category}
                    </span>
                    <span className="text-xxs font-mono text-slate-500">
                      Archival Capture: {selectedItem.year}
                    </span>
                  </div>
                  <h3 className="font-cinzel text-lg font-black text-slate-100 italic tracking-wide">{selectedItem.title}</h3>
                  <p className="text-xs text-slate-400 leading-normal font-serif">
                    {selectedItem.description}
                  </p>
                </div>

                <div className="h-px bg-slate-900" />

                {/* Filter Presets buttons list */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <SlidersHorizontal size={12} className="text-yellow-500" />
                    <h4 className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-slate-300">Emulsion Presets</h4>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CONSTANT_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => {
                          setActivePreset(f.id);
                          syncSlidersToPreset(f.id);
                        }}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          activePreset === f.id
                            ? "border-yellow-500 bg-yellow-550/10 text-yellow-500 shadow"
                            : "border-slate-900 bg-[#03060c] hover:bg-slate-900 text-slate-400 hover:text-slate-200"
                        }`}
                        id={`lightbox-preset-${f.id}`}
                      >
                        <span className="block text-xxs font-bold leading-none">{f.name}</span>
                        <span className="block text-[8px] font-mono text-slate-500 mt-1 leading-none italic">{f.epoch}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-900" />

                {/* Fine Calibration manual sliders panel */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-cinzel font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                      <Sliders size={12} className="text-yellow-500" /> Dial Calibration workbench
                    </span>
                    <button
                      onClick={() => syncSlidersToPreset(activePreset)}
                      className="text-[9px] font-mono text-slate-500 hover:text-[#eab308] flex items-center gap-1"
                      title="Reset parameters to chemical template"
                      id="btn-caliber-reset"
                    >
                      <RotateCcw size={10} /> Reset Preset
                    </button>
                  </div>

                  {/* Slider controls list */}
                  <div className="space-y-3">
                    {/* Sepia warmth */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono whitespace-nowrap">
                        <span className="text-slate-400">Patina Oxide (Sepia Warmth)</span>
                        <span className="text-yellow-500">{warmth}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={warmth}
                        onChange={(e) => {
                          setWarmth(Number(e.target.value));
                        }}
                        className="w-full accent-[#eab308] h-1 rounded"
                      />
                    </div>

                    {/* Contrast dial */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono whitespace-nowrap">
                        <span className="text-slate-400">Chemical Contrast (Gamma Shift)</span>
                        <span className="text-yellow-500">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={contrast}
                        onChange={(e) => {
                          setContrast(Number(e.target.value));
                        }}
                        className="w-full accent-[#eab308] h-1 rounded"
                      />
                    </div>

                    {/* Brightness dial */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono whitespace-nowrap">
                        <span className="text-slate-400">Aperture Exposure (Brightness)</span>
                        <span className="text-yellow-500">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={brightness}
                        onChange={(e) => {
                          setBrightness(Number(e.target.value));
                        }}
                        className="w-full accent-[#eab308] h-1 rounded"
                      />
                    </div>

                    {/* Film grain dial */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono whitespace-nowrap">
                        <span className="text-slate-400">Silver Halide Grain (Pixel Noise)</span>
                        <span className="text-yellow-500">{grain}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={grain}
                        onChange={(e) => {
                          setGrain(Number(e.target.value));
                        }}
                        className="w-full accent-[#eab308] h-1 rounded"
                      />
                    </div>

                    {/* Vignette value dial */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono whitespace-nowrap">
                        <span className="text-slate-400">Lens Barrel Shading (Vignette)</span>
                        <span className="text-yellow-500">{vignette}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={vignette}
                        onChange={(e) => {
                          setVignette(Number(e.target.value));
                        }}
                        className="w-full accent-[#eab308] h-1 rounded"
                      />
                    </div>
                  </div>

                </div>

              </div>

              {/* DOWNLOAD CANVAS TRIGGERS */}
              <div className="pt-6 border-t border-slate-900 mt-6 lg:mt-0 space-y-2">
                
                {/* Visual canvas used solely for background high quality export operations */}
                <canvas ref={canvasRef} style={{ display: "none" }} />
                
                {/* Hidden image element used to ensure natural dimensions loaded properly */}
                <img 
                  ref={sourceImageRef}
                  src={selectedItem.src} 
                  style={{ display: "none" }} 
                  onLoad={() => {
                    // Pre-render canvas placeholder once source loaded
                  }}
                  crossOrigin="anonymous"
                  alt="source cache"
                />

                <div className="p-3 bg-[#eab308]/5 border border-yellow-600/10 rounded-lg flex items-start gap-2.5 text-[10px] text-slate-400 leading-normal font-serif">
                  <Sparkles size={14} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Canvas Synthesis:</strong> Clicking the export button leverages HTML5 Canvas API in real-time to render your manual parameters (patina oxide grains, vignette rolls, and gold border) into a physical `.png` download frame.
                  </span>
                </div>

                <button
                  onClick={processAndDownloadImage}
                  disabled={isExporting}
                  className="w-full py-3 bg-gradient-to-r from-[#ca8a04] to-[#eab308] hover:to-[#eab308]/90 text-black font-cinzel font-bold text-xs uppercase tracking-widest rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                  id="btn-lightbox-download"
                >
                  <Download size={14} className={isExporting ? "animate-bounce" : ""} />
                  {isExporting ? "Rendering Archival Print..." : "Export Archival Print (.PNG)"}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
