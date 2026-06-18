/**
 * Authoritative Biography Data for Late Barrister Ibeni Iwolo
 */

export interface Milestone {
  year: string;
  title: string;
  category: 'personal' | 'academic' | 'legal' | 'faith' | 'leadership';
  description: string;
  details?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Legal' | 'Speeches' | 'Awards' | 'Faith';
  date: string;
  summary: string;
  pages: number;
  previewText: string;
}

export interface Tribute {
  id: string;
  name: string;
  relation: string;
  message: string;
  candlesLit: number;
  date: string;
  category: 'family' | 'colleague' | 'church' | 'community';
}

export const BIOGRAPHY_DATA = {
  personalInfo: {
    fullName: "Late Barrister Ibeni Iwolo",
    title: "Barrister Ibeni Iwolo",
    epitaph: "A Life of Quiet Influence, Service and Enduring Legacy",
    years: "1960 – 2024",
    birthDate: "October 12, 1960",
    birthPlace: "Okolobiri Town, Bayelsa State, Nigeria",
    hometown: "Okolobiri, Gbarain Clan, Yenagoa LGA, Bayelsa State",
    quote: "His relevance was not built on noise, but on consistency, reliability, and quiet influence.",
    chambers: "Ibeni Iwolo & Associates (Obiyingi Chambers)",
  },

  narratives: {
    introduction: `Barrister Ibeni Iwolo was a man of remarkable depth, outstanding intellectual pedigree, and unmatched humility. Throughout his illustrious career as an advocate, community builder, and faith leader, he consistently chose quiet impact over public clamor. He was the anchor for his community, the legal shield for the vulnerable, and a towering beacon of moral clarity for the Ijaw Nation. He did not chase fame; instead, he chased justice, service, and legacy.`,
    
    earlyLife: `Born in 1960 during the dawn of Nigeria's independence, Ibeni Iwolo grew up surrounded by the serene creeks and lush wetlands of Okolobiri in the Gbarain Clan of modern-day Bayelsa State. Raised with a deep sense of community responsibility, his early character was forged in the values of truth, hard work, and loyalty to his ancestry. He attended Central School Okolobiri for his primary education, showing brilliant academic aptitudes from a tender age, before proceeding to the historic Gbarainowei Grammar School, where he distinguished himself as a scholarly leader.`,
    
    legalCareer: `Admitted to the Rivers State University of Science and Technology (now RSU) in Port Harcourt to study Law, Ibeni excelled, obtaining his Bachelor of Laws (LL.B) with honors. He then proceeded to the prestigious Nigerian Law School, Lagos, where he was called to the Nigerian Bar as a Solicitor and Advocate of the Supreme Court of Nigeria. 
    
    In Yenagoa, he established **Ibeni Iwolo & Associates**, popularly known as **Obiyingi Chambers**. Under his visionary leadership, Obiyingi Chambers became synonymous with legal excellence, uncompromising ethics, and fierce advocacy for human rights. He dedicated major portions of his practice to pro-bono representations, defending local farmers, youth organizations, and marginalized widows against structural injustices and land encroachment. Over three decades of practice, he mentored dozens of junior counsels who now sit proudly in various judicial heights across Nigeria.`,
    
    communityINC: `A passionate son of the soil, Barrister Iwolo was a pillar of the Ijaw socio-cultural renaissance. His sharp intellect and balanced reasoning made him a natural leader within the Ijaw National Congress (INC), the apex organization defending Ijaw interests. He served meritoriously as the Vice Chairman of the INC Central Zone and subsequently stepped up as Acting Chairman during a critical transitional period. 
    
    His crowning community service was his role in the INC National Reconciliation Committee, where his diplomatic tact, deep knowledge of local history, and legal acumen helped settle multi-decade inter-communal disputes and land grievances across the Niger Delta. He advocated passionately for sustainable development, environmental cleanup in the oil-rich creeks, and the intellectual empowerment of the Ijaw youth.`,
    
    christianFaith: `Barrister Iwolo’s life was deeply anchored in his unwavering Christian faith within the Anglican Communion. He did not merely attend church; he served it with his profession and soul. He was appointed the Diocesan Secretary and Legal Adviser to the Bishop of the Diocese of Niger Delta West, translating canon law and guiding ecclesiastical administration with stellar wisdom. 
    
    As a dedicated Patron of the Boys' Brigade Nigeria, he spent his personal weekends organizing faith camps, drilling exercises, and leadership seminars, molding thousands of Young Christian boys into upright, disciplined citizens. His faith was his compass, guiding his professional ethics and personal interactions every single day.`,
    
    entrepreneurship: `Believing in grassroots financial independence, Barrister Iwolo was a pioneering agricultural entrepreneur. He established a state-of-the-art Local Fish Farming and Aquaculture Enterprise in Yenagoa. Far from a passive investment, he could often be seen in farming gear, inspecting ponds, studying marine nutrients, and directly working alongside local youths. He utilized his farms as a practical vocational center, providing employment to dozens of struggling community members and teaching youth that agriculture is a noble, viable alternative to fossil-fuel dependency.`,
    
    familyLife: `At home, Barrister Iwolo was a warm, devoted husband, and a loving father. He believed that the family is the foundational unit of any successful society. His home in Okolobiri and Yenagoa was a sanctuary of love, laughter, and high-minded discourse. He championed academic excellence, telling his children that education is an inheritance that no moth can devour. He was a surrogate father and mentor to over 50 professionals, students, and community youths, paying tuition, sponsoring legal callings, and offering steady counsel behind closed doors.`
  },

  metrics: [
    { value: "30+", label: "Years of Legal Excellence" },
    { value: "50+", label: "Young Advocates Mentored" },
    { value: "3", label: "Major Peace Accords Written" },
    { value: "100+", label: "Academic Scholarships Awarded" }
  ],

  milestones: [
    {
      year: "1960",
      title: "Birth of a Statesman",
      category: "personal",
      description: "Born into the historic Gbarain Clan in Okolobiri, Bayelsa State, during Nigeria's year of independence.",
      details: "His childhood was closely connected with the riverside communities, learning traditional lore, language, and cultural ethics from elder fishermen and storytellers."
    },
    {
      year: "1973",
      title: "Primary Education Honors",
      category: "academic",
      description: "Completed his primary education at Central School Okolobiri, earning top honors and writing skills.",
      details: "His schoolmasters noted his natural eloquence and passion for debate even in childhood."
    },
    {
      year: "1979",
      title: "Secondary Education Distinction",
      category: "academic",
      description: "Graduated with brilliant marks from Gbarainowei Grammar School, Okolobiri.",
      details: "He served as a senior prefect, guiding student-teacher relations and establishing the literary and debating society."
    },
    {
      year: "1985",
      title: "Rivers State University LL.B",
      category: "academic",
      description: "Admitted into the Rivers State University of Science and Technology, Port Harcourt to read Law.",
      details: "Excelled in constitutional law, mock court debates, and administrative jurisprudence, sparking his ultimate passion for human defense."
    },
    {
      year: "1987",
      title: "Calling to the Nigerian Bar",
      category: "legal",
      description: "Successfully graduated from the Nigerian Law School in Lagos and was called to the Supreme Court of Nigeria.",
      details: "Began his legal career in Port Harcourt before moving back to Yenagoa to directly impact his home state."
    },
    {
      year: "1997",
      title: "Obiyingi Chambers Inauguration",
      category: "legal",
      description: "Founded Ibeni Iwolo & Associates (Obiyingi Chambers) in Yenagoa.",
      details: "The chambers stood as a fortress of constitutional defense, advocating for land reform, environmental justice, and pro-bono defense for indigent citizens."
    },
    {
      year: "2005",
      title: "INC Central Zone Vice Chairmanship",
      category: "leadership",
      description: "Elected as Central Zone Vice Chairman of the apex Ijaw National Congress.",
      details: "He drove high-stakes regional dialogues, negotiating resource development, environmental stewardship, and advocating for minorities."
    },
    {
      year: "2010",
      title: "Anglican Diocese Appointment",
      category: "faith",
      description: "Appointed Diocesan Secretary and Legal Adviser to the Bishop of the Diocese of Niger Delta West.",
      details: "Rendered free, dedicated canon-legal counsel, structured estate acquisitions for standard missions, and reviewed constitutional guidelines of the church."
    },
    {
      year: "2014",
      title: "INC National Reconciliation Lead",
      category: "leadership",
      description: "Appointed to the INC National Reconciliation Committee as a primary mediator.",
      details: "Brokered complex community-border peace pacts, drafted legal terms of friendship between historically rival settlements, and united central political fractions."
    },
    {
      year: "2018",
      title: "Grassroots Aquaculture Launch",
      category: "personal",
      description: "Established a standard commercial fish breeding enterprise in Yenagoa.",
      details: "Pioneered localized organic fish ponds to fight hunger, boost local enterprise index, and train youth in technical farming skills."
    },
    {
      year: "2024",
      title: "A Peaceful Transition",
      category: "personal",
      description: "Passed on peacefully, leaving behind a pristine legacy of honor, deep integrity, and community faith.",
      details: "Celebrated by the legal community of Bayelsa, the Anglican hierarchy, the INC, and thousands of mentored youth across West Africa."
    }
  ] as Milestone[],

  documents: [
    {
      id: "doc-01",
      title: "Supreme Court Address on Creek Encroachments",
      category: "Legal",
      date: "Nov 2004",
      summary: "Historical brief arguing on behalf of Okolobiri smallholders against land conversions by petrochemical distributors without prior consent.",
      pages: 18,
      previewText: "IN THE SUPREME COURT OF NIGERIA... APPELLANTS: OKOLOBIRI COOPERATIVE LANDHOLDERS... RESPONDENT: INTER-STATE REFINING LTD. MY LORDS, WE HUMBLY SUBMIT THAT PROCEDURAL DEFECTS IN PUBLIC DOMAIN REGISTRATIONS CANNOT ERADICATE ANCESTRAL COMPASSION..."
    },
    {
      id: "doc-02",
      title: "Ijaw National Congress Unity Address - central declaration",
      category: "Speeches",
      date: "Aug 2008",
      summary: "A resounding speech delivered by Barrister Ibeni Iwolo as Zonal Acting Chairman at the INC Convention calling for intellectual youth advocacy over armed conflicts.",
      pages: 6,
      previewText: "OUR ESTEEMED KINSMEN, THE STRENGTH OF THE IJAW NATION LIES NOT IN THE VOLUMES OF OUR SHOUTS, BUT IN THE CONCRETE STRENGTH OF OUR ARGUMENTS, THE PRECISION OF OUR LEGAL CHALLENGES, AND THE DEPTH OF OUR INTELLECTUAL CHARACTER..."
    },
    {
      id: "doc-03",
      title: "Anglican Ecclesiastical Administration Guidelines",
      category: "Faith",
      date: "Jan 2012",
      summary: "Codification notes by the Legal Adviser on managing structural properties and standard parish operations in compliance with both canonical and civil registers.",
      pages: 24,
      previewText: "DIOCESE OF NIGER DELTA WEST (COMMUNION CODES): A MANUAL FOR PARISH COUNCILS AND PROPERTY TRUSTEES... SIGNED BARR. IBENI IWOLO. CHURCH PROPERTIES REPRESENT SACRED HOLDINGS ACCORDED TO CIVIL COVENANTS AND SPIRITUAL STEWARDSHIPS..."
    },
    {
      id: "doc-04",
      title: "Bayelsa State Eminent Award for Pro-Bono Services",
      category: "Awards",
      date: "Oct 2019",
      summary: "Official citation and certificate presentation commemorating 20 years of continuous free legal assistance to Bayelsa communities.",
      pages: 1,
      previewText: "FOR EXEMPLARY ETHICAL STANDARDS, ENDURING PATRIOTISM, AND MERITORIOUS PRO-BONO LEGAL ADVISING TO THE INDIGENT CITIZENS OF BAYELSA STATE, CO-SIGNED BY THE STATE JUDICIARY CHIEF REGISTRAR AND EXECUTIVE GOVERNOR..."
    }
  ] as DocumentItem[],

  defaultTributes: [
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
  ] as Tribute[]
};
