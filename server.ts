import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc,
  doc, 
  updateDoc, 
  getDoc, 
  query 
} from "firebase/firestore";

dotenv.config();

// Initialize Gemini API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Firebase Client
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let db: any = null;

if (fs.existsSync(firebaseConfigPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    const firebaseApp = initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    db = getFirestore(firebaseApp, config.firestoreDatabaseId || "(default)");
    console.log("[FIREBASE SUCCESS] Web Firestore Client initialized in server with project id:", config.projectId);
  } catch (error) {
    console.error("Failed to initialize Web Firestore Client:", error);
  }
} else {
  console.warn("firebase-applet-config.json not found!");
}

// Default elements in case Firestore is empty or missing
const initialTributes = [
  {
    id: "trib-01",
    name: "Hon. Justice Tonye Alagoa",
    relation: "Colleague / Retired Judge",
    message: "Barrister Ibeni Iwolo was a lawyer's lawyer. In my courtroom, whenever he rose to speak, we listened. His briefs were meticulous, his decorum was flawless, and his logic was titanium. His legacy lives in the hearts of every lawyer he mentored in Bayelsa State.",
    candlesLit: 45,
    date: "2024-06-12",
    category: "colleague"
  },
  {
    id: "trib-02",
    name: "Mildred Iwolo",
    relation: "Daughter",
    message: "My father taught us that integrity is the only garment that never goes out of style. He was always there to resolve every doubt with a calm smile. In his busy schedule, he never missed a school play, a church choir recitation, or a family discussion. We miss his quiet strength daily.",
    candlesLit: 120,
    date: "2024-05-30",
    category: "family"
  },
  {
    id: "trib-03",
    name: "Venerable Ezekiel Gbarain",
    relation: "Anglican Archdeacon",
    message: "As our Diocesan Secretary and Legal Adviser, Barrister Iwolo shielded the church from dozens of legal traps with absolute devotion and voluntary labor. He would travel hundreds of kilometers on dirt roads to verify a rural church land boundary without charging a single kobo. A true soldier of Christ.",
    candlesLit: 58,
    date: "2024-07-02",
    category: "church"
  },
  {
    id: "trib-04",
    name: "Chief Preye Alamieyesegha",
    relation: "INC Community Elder",
    message: "When the INC was divided, Barrister Ibeni was the bridge. His humility disarmed the angriest youth, and his wisdom silenced the loudest cynics. He brought peace where many thought it impossible. We have lost a true Ijaw statesman whose memory remains forever fresh.",
    candlesLit: 76,
    date: "2024-06-25",
    category: "community"
  }
];

// Async loader helper to sync and seed tributes from/to Firestore
async function getTributesFromFirestore() {
  if (!db) {
    console.warn("Firebase Firestore not initialized! Using fallback.");
    return initialTributes;
  }
  try {
    const tributesRef = collection(db, "tributes");
    const q = query(tributesRef);
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (list.length === 0) {
      console.log("Firestore tributes collection is empty. Seeding with initial tributes...");
      for (const item of initialTributes) {
        const docRef = doc(db, "tributes", item.id);
        const { id, ...data } = item;
        await setDoc(docRef, data);
        list.push(item);
      }
    }

    // Sort: newest date first, break ties with ID string
    list.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.id.localeCompare(a.id);
    });
    return list;
  } catch (err) {
    console.error("Error loading tributes from Firestore:", err);
    return initialTributes;
  }
}

// Full Biography system context for the Chatbot
const BIOGRAPHY_SYSTEM_CONTEXT = `
You are the virtual biography assistant and elder legal guardian dedicated to preserving the pristine memory, sharing the records, and echoing the wisdom of the Late Barrister Ibeni Iwolo (1960–2024)—an esteemed advocate from Bayelsa State, Nigeria, known for his professional integrity, humble lifestyle, and profound "quiet influence".

Here are the authoritative, verified facts of Barrister Ibeni Iwolo's life, achievements, values, and community milestones. You MUST strictly adhere ONLY to these facts when responding:

- FULL NAME: Late Barrister Ibeni Iwolo (often called Barrister Ibeni, Obiyingi)
- LIFE DATES: 1960 – 2024 (Born October 12, 1960; passed away in 2024).
- HOMETOWN & ROOTS: Okolobiri Town, Gbarain Clan, Yenagoa Local Government Area, Bayelsa State, Nigeria. 
- VIBE / STYLE: A Life of Quiet Influence, Service, and Enduring Legacy. His prominence was not built on loud fanfare, but on reliability, consistency, and intellectual diligence.

- EDUCATION & ACADEMICS:
  1) Central School Okolobiri: Completed primary education with top writeups and academic honors. Known to be highly eloquent early on.
  2) Gbarainowei Grammar School, Okolobiri: Completed secondary education, serving as Senior Prefect, setting up debate forums.
  3) Rivers State University of Science and Technology (now RSU), Port Harcourt: Obtained Bachelor of Laws (LL.B) with honors, excelling in moot debates and public civil actions.
  4) Nigerian Law School, Lagos: Called to the Bar of the Supreme Court of Nigeria as a Solicitor and Advocate.

- LEGAL CAREER:
  - Established "Ibeni Iwolo & Associates", widely as "Obiyingi Chambers" in Yenagoa, Bayelsa State.
  - Specialized in land dispute mediation, environmental defense, human rights, and public-interest case loads.
  - Known for extensive pro-bono (free of charge) defense representing marginalized farmers, youth groups, and widows facing wrongful encroachments.
  - Mentored over 50 junior lawyers, guiding their ethics and professional advancement into higher corporate and judicial positions.

- COMMUNITY & IJAW NATIONAL ADVOCACY:
  - Deep patriot and civic elder of the Ijaw Nation.
  - Served as the Vice Chairman of the Ijaw National Congress (INC) Central Zone and subsequently as the Acting Chairman of the zone.
  - Formed a central part of the INC National Reconciliation Committee, resolving age-old land partitions and political fractions using gentle mediation.
  - Advocated for regional environmental reclamation, resource governance, and intellectual programs for Niger Delta youths.

- FAITH & CHRISTIAN SERVICE:
  - Devout Anglican of the Diocese of Niger Delta West of the Anglican Communion.
  - Served as the Diocesan Secretary and Legal Adviser to the Bishop. Provided free legal counsels on ecclesiastic statutes, parish trusts, and property deeds.
  - Patron of the Boys' Brigade Nigeria. Mentored young boys to practice disciplined Christian leadership and civic responsibility.

- BUSINESS & ENTREPRENEURSHIP:
  - Established a robust mechanized Fish Farming Enterprise (aquaculture) in Yenagoa.
  - Provided direct training, job employments, and vocational courses to dozens of community youths, proving that grassroots agriculture is high-yielding and noble.

- PERSONAL & FAMILY:
  - Highly devoted family man, caring husband, and stellar father. Always prioritized his children's scholarship, declaring education an immortal inheritance.
  - Mentored more than 50 community professionals and students. Famous for being accessible, simple, and full of grace.

RESPONSE STYLE GUIDELINES:
1. Respond with absolute warmth, high intellect, deep respect, professional poise, and dignity. Use professional and welcoming language.
2. Only tell facts that match the biography context above. NEVER invent years, dates, children's names (except Mildred), or legal cases that are not defined in the text.
3. If a visitor asks you a personal or speculative item not explicitly written in the facts above, gracefully and politely explain that you don't have that specific file in your archives, and smoothly redirect them to celebrate his established history of INC stewardship, pro-bono defense, Anglican devotion, or local fish farm enterprise.
4. Keep paragraphs short and elegant. Use bullet points where appropriate for lists or timelines to make reading effortless.
`;

// API: Get guest messages
app.get("/api/tributes", async (req, res) => {
  try {
    const tributes = await getTributesFromFirestore();
    res.json(tributes);
  } catch (err) {
    console.error("Error getting tributes:", err);
    res.status(500).json({ error: "An error occurred fetching tributes." });
  }
});

// API: Submit a tribute
app.post("/api/tributes", async (req, res) => {
  try {
    const { name, relation, message, category } = req.body;
    
    if (!name || !message) {
      return res.status(400).json({ error: "Name and message are required." });
    }

    const id = `trib-${Date.now()}`;
    const newTributeData = {
      name: name.trim().slice(0, 80),
      relation: (relation || "Visitor").trim().slice(0, 100),
      message: message.trim().slice(0, 1000),
      candlesLit: 1, // Auto-ignite one candle on launch
      date: new Date().toISOString().split("T")[0],
      category: ["family", "colleague", "church", "community"].includes(category) ? category : "community"
    };

    if (db) {
      const docRef = doc(db, "tributes", id);
      await setDoc(docRef, newTributeData);
      res.status(201).json({ id, ...newTributeData });
    } else {
      res.status(500).json({ error: "Firestore database not initialized." });
    }
  } catch (err) {
    console.error("Error creating tribute:", err);
    res.status(500).json({ error: "An error occurred while saving your tribute." });
  }
});

// API: Light virtual candle for a member
app.post("/api/tributes/:id/light", async (req, res) => {
  try {
    const { id } = req.params;
    if (!db) {
      return res.status(500).json({ error: "Firestore database not initialized." });
    }

    const docRef = doc(db, "tributes", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentData = docSnap.data();
      const newCandledLit = (currentData.candlesLit || 0) + 1;
      await updateDoc(docRef, { candlesLit: newCandledLit });
      res.json({ id: docSnap.id, ...currentData, candlesLit: newCandledLit });
    } else {
      res.status(404).json({ error: "Tribute not found." });
    }
  } catch (err) {
    console.error("Error lighting candle:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// API: Dynamic SVG Open Graph Image Generator for Social Shares on-the-fly
app.get("/api/og/image", (req, res) => {
  try {
    const title = (req.query.title as string) || "Barrister Ibeni Iwolo";
    const desc = (req.query.desc as string) || "Digital Memorial & Preservation of a Legendary Bayelsa Advocate.";
    const type = (req.query.type as string) || "MEMORIAL RECORD";
    const author = (req.query.author as string) || "";

    // Safely XML-escape strings to prevent rendering breaks
    const escapeXml = (str: string) => {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
    };

    const cleanTitle = escapeXml(title);
    const cleanDesc = escapeXml(desc);
    const cleanType = escapeXml(type).toUpperCase();
    const cleanAuthor = escapeXml(author);

    const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#04070d" />
          <stop offset="100%" stop-color="#0a101e" />
        </linearGradient>
      </defs>
      
      <!-- Base Palette -->
      <rect width="1200" height="630" fill="url(#bg)" />
      
      <!-- Ornate Gold Outer Filigree Frame -->
      <rect x="25" y="25" width="1150" height="580" fill="none" stroke="#ca8a04" stroke-width="4.5" stroke-opacity="0.5" rx="10" />
      <rect x="37" y="37" width="1126" height="556" fill="none" stroke="#ca8a04" stroke-width="1.5" stroke-opacity="0.2" rx="8" />

      <!-- Corner Highlights -->
      <path d="M25,65 L65,25" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-opacity="0.6" />
      <path d="M1175,65 L1135,25" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-opacity="0.6" />
      <path d="M25,565 L65,605" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-opacity="0.6" />
      <path d="M1175,565 L1135,605" fill="none" stroke="#ca8a04" stroke-width="2.5" stroke-opacity="0.6" />

      <!-- Radial background highlight concentric rings -->
      <circle cx="600" cy="315" r="180" fill="none" stroke="#eab308" stroke-width="1" stroke-opacity="0.04" />
      <circle cx="600" cy="315" r="150" fill="none" stroke="#eab308" stroke-width="1" stroke-opacity="0.02" stroke-dasharray="8,8" />

      <!-- Content wrapper using standardized foreignObejct -->
      <foreignObject x="80" y="70" width="1040" height="490">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; font-family: 'Cinzel', 'Times New Roman', serif; box-sizing: border-box; padding: 15px 10px;">
          
          <!-- Master Ribbon Header -->
          <div style="text-align: center;">
            <div style="color: #ca8a04; font-size: 13px; text-transform: uppercase; letter-spacing: 5px; font-weight: 700; margin-bottom: 6px;">
              In Honor &amp; Loving Memory of
            </div>
            <h1 style="margin: 0; padding: 0; color: #ffffff; font-size: 40px; text-transform: uppercase; letter-spacing: 4px; font-weight: 950; text-shadow: 0 4px 10px rgba(0,0,0,0.6);">
              Barrister Ibeni Iwolo
            </h1>
            <div style="color: #94a3b8; font-size: 14px; font-family: monospace; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;">
              Legacy Chronicle (1960 – 2024) • Yenagoa, Nigeria
            </div>
            <div style="width: 160px; height: 1.5px; background: linear-gradient(90deg, transparent, #eab308, transparent); margin: 15px auto 0 auto;"></div>
          </div>

          <!-- Display Body Card -->
          <div style="background: rgba(3, 6, 12, 0.55); border: 1.5px solid rgba(234, 180, 8, 0.15); border-radius: 12px; padding: 25px 35px; text-align: center; margin: 15px 0; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
            <div style="display: inline-block; padding: 4px 12px; background: rgba(234, 179, 8, 0.1); border: 1.5px solid rgba(234, 179, 8, 0.25); border-radius: 6px; color: #eab308; font-size: 10px; text-transform: uppercase; font-family: monospace; letter-spacing: 2px; margin-bottom: 12px; font-weight: bold;">
              ${cleanType}
            </div>
            <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 1px; line-height: 1.3;">
              ${cleanTitle}
            </h2>
            <p style="margin: 0; color: #cbd5e1; font-size: 15.5px; font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.6; font-style: italic; max-width: 840px; margin: 0 auto; overflow: hidden; max-height: 130px;">
              "${cleanDesc.length > 220 ? cleanDesc.slice(0, 217) + '...' : cleanDesc}"
            </p>
            ${cleanAuthor ? `<div style="margin-top: 12px; color: #a1a1aa; font-size: 12px; font-family: monospace; text-transform: uppercase; tracking: 1px;">— Shared by ${cleanAuthor}</div>` : ""}
          </div>

          <!-- Base Seal Credentials -->
          <div style="display: flex; justify-content: space-between; align-items: center; color: #52525b; font-size: 10px; font-family: monospace; letter-spacing: 1.5px;">
            <div>OBOYINGI FAMILY PORTAL</div>
            <div style="color: #ca8a04; font-weight: 700; display: flex; align-items: center; gap: 4px;">
              <span>•</span> DYNAMIC MEMORIAL RECORD <span>•</span>
            </div>
            <div>VERIFIED ARCHIVE CITATION</div>
          </div>

        </div>
      </foreignObject>
    </svg>
    `;

    res.setHeader("Content-Type", "image/svg+xml");
    res.send(svg);
  } catch (err) {
    console.error("Error creating Open Graph dynamic SVG image:", err);
    res.status(500).send("An error occurred generating image.");
  }
});

// API: AI Biography Chatbot Proxy using @google/genai (server-side ONLY)
app.post("/api/chatbot", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ 
        text: "I am ready to assist you. To allow me to access my fully operational memory database, please set up your `GEMINI_API_KEY` in the Secrets panel in the AI Studio UI under Settings."
      });
    }

    // Format chat history for Gemini
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((turn: { role: 'user' | 'model'; parts: { text: string }[] }) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.parts[0].text }],
        });
      });
    }

    // Append current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: BIOGRAPHY_SYSTEM_CONTEXT,
        topP: 0.95,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("Error in Gemini API chatbot route:", err);
    res.status(500).json({ 
      error: "Our biographical neural relays are momentarily saturated. Please try seeking counsel again in few moments.",
      details: err?.message || "" 
    });
  }
});

// Setup Vite & static server
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets from the 'dist' folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      const indexHtmlPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexHtmlPath)) {
        try {
          let html = fs.readFileSync(indexHtmlPath, "utf-8");
          
          const shareTitle = (req.query.share_title as string) || "Late Barrister Ibeni Iwolo Memorial Portal";
          const shareDesc = (req.query.share_desc as string) || "Preservation, Interactive Biography & Memorial Wall of one of Bayelsa state’s greatest advocate minds.";
          const shareType = (req.query.share_type as string) || "MEMORIAL ADVOCACY";
          const shareAuthor = (req.query.share_author as string) || "";

          // Resolve absolute host URLs
          const host = req.get("host") || "localhost:3000";
          const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
          
          const imageUrl = `${protocol}://${host}/api/og/image?title=${encodeURIComponent(shareTitle)}&desc=${encodeURIComponent(shareDesc)}&type=${encodeURIComponent(shareType)}&author=${encodeURIComponent(shareAuthor)}`;

          const metaTags = `
          <title>${shareTitle}</title>
          <meta property="og:title" content="${shareTitle}" />
          <meta property="og:description" content="${shareDesc}" />
          <meta property="og:image" content="${imageUrl}" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${shareTitle}" />
          <meta name="twitter:description" content="${shareDesc}" />
          <meta name="twitter:image" content="${imageUrl}" />`;

          // Replace title tag if present, otherwise inject in head
          if (html.includes("<title>")) {
            html = html.replace(/<title>[^<]*<\/title>/i, metaTags);
          } else {
            html = html.replace("<head>", `<head>${metaTags}`);
          }
          
          res.send(html);
        } catch (err) {
          console.error("Error patching OG headers dynamic HTML:", err);
          res.sendFile(indexHtmlPath);
        }
      } else {
        res.sendFile(indexHtmlPath);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULLSTACK SUCCESS] Server running on http://localhost:${PORT}`);
  });
}

init();
