import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaTimes, FaRobot, FaVolumeUp } from 'react-icons/fa';

// ─── Voice command definitions ───────────────────────────────────────────────
const COMMANDS = [
  // ── DASHBOARD ──
  { triggers: ['how many farms', 'farms registered', 'total farms', 'farm count'],
    response: () => 'There are 12 farms currently registered in the system. 10 are active, 1 is pending approval, and 1 is inactive.' },
  { triggers: ['pending farm approval', 'pending approvals', 'farms pending', 'approve farms'],
    response: () => '1 farm is currently pending approval: Green Valley Poultry Farm, submitted on August 1st. You can approve or reject it from the Farm Management panel.' },
  { triggers: ['analytics dashboard', 'open analytics', 'show analytics'],
    response: () => 'Opening the analytics dashboard now. It shows farm performance, revenue trends, mortality rates, and feed consumption across all farms.' },
  { triggers: ['highest mortality', 'farm highest mortality', 'most deaths', 'worst mortality'],
    response: () => 'Farm 7 — Sunrise Poultry has the highest mortality rate this month at 4.2 percent, primarily due to a Newcastle Disease outbreak in Shed 3.' },
  { triggers: ["today's alerts", 'show alerts', 'current alerts', 'alerts today'],
    response: () => "Today's alerts: 1. Feed stock low in Farm 3. 2. Vaccination overdue for Batch B in Shed 2. 3. Medicine expiry in 2 days — Tylosin 500mg. 4. Worker Kumar marked absent without notice." },

  // ── FARM MANAGEMENT ──
  { triggers: ['approve green farm', 'approve farm', 'farm approved'],
    response: () => 'Green Farm has been approved and the Farm Admin has been notified via email. The farm is now active in the system.' },
  { triggers: ['reject abc poultry', 'reject farm', 'farm rejected'],
    response: () => 'ABC Poultry has been rejected. A notification with the reason has been sent to the applicant.' },
  { triggers: ['create farm admin', 'add farm admin', 'new farm admin'],
    response: () => 'To create a new Farm Admin, go to Farm Management and click Add Farm Admin. Fill in name, email, and assign a farm.' },
  { triggers: ['deactivate farm', 'disable farm', 'farm 15'],
    response: () => 'Farm 15 has been deactivated. All associated users will lose access until the farm is reactivated.' },

  // ── REPORTS ──
  { triggers: ['generate monthly report', 'monthly report', 'create monthly report'],
    response: () => 'Generating the monthly farm report now. It covers animals, feed, medicine, worker attendance, and revenue for July 2026. Download will be ready in a moment.' },
  { triggers: ['download farm summary', 'farm summary report', 'download summary'],
    response: () => 'Farm summary report is being prepared. You can download it as PDF or Excel from the Reports section.' },
  { triggers: ['email reports', 'send reports', 'email all admins'],
    response: () => 'Monthly reports have been emailed to all 12 registered Farm Admins successfully.' },

  // ── ANIMAL MANAGEMENT ──
  { triggers: ['register broiler', 'register 500', 'add broiler', 'register chickens'],
    response: () => '500 broiler chickens have been registered successfully. They are assigned to Shed 4 with purchase date today. RFID tagging is pending.' },
  { triggers: ['show sick animals', 'sick animals', 'sick birds'],
    response: () => '6 animals are currently marked sick. 2 in Shed 1 with respiratory symptoms, 3 in Shed 2 with coccidiosis, and 1 in isolation with unknown infection.' },
  { triggers: ['how many birds healthy', 'healthy animals', 'healthy birds'],
    response: () => '1,180 out of 1,250 animals are currently healthy. That is a health rate of 94.4 percent.' },

  // ── FEED ──
  { triggers: ['current feed stock', 'feed stock', 'how much feed'],
    response: () => 'Current feed stock is 2.5 Tons. Poultry Mix: 1.2 Tons. Corn Bran: 0.8 Tons. Soybean Meal: 0.5 Tons. Minimum threshold is 500 kilograms per type.' },
  { triggers: ['feed below minimum', 'feed stock minimum', 'low feed', 'low stock'],
    response: () => 'Soybean Meal is currently below the minimum threshold at 480 kilograms. A reorder is recommended immediately.' },
  { triggers: ['create purchase order', 'purchase order', 'create po'],
    response: () => 'A Purchase Order has been created for Soybean Meal — 500 kilograms at estimated cost of ₹12,500. It is now in Pending Approval status.' },

  // ── MEDICINE ──
  { triggers: ['show medicine stock', 'medicine stock', 'medicine inventory'],
    response: () => 'Current medicine stock: Tylosin 500mg — 80 units. Amprolium — 120 units. Sulphonamides — 150 units. Total: 350 units across 18 medicine types.' },
  { triggers: ['expired medicines', 'expired medicine', 'medicine expired'],
    response: () => '2 medicine batches are expired: Oxytetracycline batch OX-21 and Vitamin E supplement V-09. These must be disposed of immediately per safety protocols.' },
  { triggers: ['medicines expiring', 'expiring this week', 'near expiry medicine'],
    response: () => '3 medicines are expiring within 7 days: Tylosin 500mg on August 5th, Marek Vaccine on August 7th, and Colistin Sulfate on August 8th.' },

  // ── WORKERS ──
  { triggers: ["today's attendance", 'attendance today', 'worker attendance today'],
    response: () => "Today's attendance: 28 present, 2 absent, 2 on approved leave. Attendance rate is 87.5 percent. Late arrivals: 3 workers checked in after 9:30 AM." },
  { triggers: ['absent workers', 'who is absent', 'absent today'],
    response: () => '2 workers are absent today without prior notice: Raju (ID: W-012) and Meena (ID: W-019). The supervisor has been notified.' },
  { triggers: ['assign work to kumar', 'assign kumar', 'assign task kumar'],
    response: () => 'A task has been assigned to Kumar: Morning Feed Distribution in Shed 2. Due by 10:00 AM today. Kumar will receive a notification.' },

  // ── VET / HEALTH ──
  { triggers: ['critical animals', 'show critical', 'critical cases'],
    response: () => '3 animals are in critical condition. Batch Broiler 3 — Shed 2 has severe respiratory distress. Layer Batch C — Shed 3 has suspected Newcastle Disease. Both require immediate veterinary attention.' },
  { triggers: ['treatment history', 'open treatment history', 'animal treatment'],
    response: () => 'Opening treatment history. Recent treatments: Tylosin 500mg for Batch Broiler 2 — Day 3 of 5. Amprolium for Layer Batch A — completed 2 days ago.' },
  { triggers: ['record newcastle', 'newcastle disease', 'log disease'],
    response: () => 'Newcastle Disease has been recorded for Shed 3, affecting 18 birds. The case has been flagged as Critical and an emergency alert sent to the vet on duty.' },
  { triggers: ['vaccinate shed 3', 'vaccinate shed', 'start vaccination shed'],
    response: () => 'Vaccination task initiated for Shed 3. Assigned to Dr. Priya. Vaccine: Newcastle ND. 800 birds to be vaccinated. Status set to In Progress.' },
  { triggers: ['animals due for vaccination', 'vaccination due', 'animals need vaccine'],
    response: () => '18 animals have vaccinations due today. Shed 1: 1,000 birds for Newcastle ND. Shed 3: 800 birds for Marek Disease. Please begin now.' },

  // ── WORKER COMMANDS ──
  { triggers: ['start today work', 'start my work', 'begin work'],
    response: () => "Today's work has been started. Your tasks: 1. Morning feed — Shed 2. 2. Clean water troughs — Shed 1. 3. Afternoon health check. Good luck!" },
  { triggers: ['mark attendance', 'mark my attendance', 'check in'],
    response: () => 'Your attendance has been marked as Present at ' + new Date().toLocaleTimeString() + '. Have a productive day!' },
  { triggers: ['feed completed', 'feeding done', 'feeding complete'],
    response: () => 'Feed task marked as completed. Consumption logged: 120 kilograms for Shed 2. Good work!' },
  { triggers: ['report sick chicken', 'sick bird report', 'chicken sick'],
    response: () => 'Sick bird report submitted. Location: your assigned shed. The vet and supervisor have been notified. Please isolate the affected bird immediately.' },
  { triggers: ["today's tasks", 'my tasks', 'open tasks today'],
    response: () => "Today's tasks for you: 1. Morning feed distribution — Pending. 2. Shed cleaning — In Progress. 3. Vaccination assist — Due 2 PM. 4. Evening head count." },

  // ── AI Q&A ──
  { triggers: ['birds died this month', 'how many died', 'mortality this month', 'deaths this month'],
    response: () => '45 birds have died this month. Cause breakdown: 22 from disease, 12 from natural causes, 8 from heat stress, and 3 from injury. Mortality rate is 3.6 percent.' },
  { triggers: ['highest disease rate', 'shed disease rate', 'which shed disease'],
    response: () => 'Shed 2 has the highest disease rate this month at 8.4 percent, primarily due to a Respiratory Syndrome outbreak affecting 42 birds. Immediate biosecurity review is recommended.' },
  { triggers: ['how much medicine used', 'medicine used', 'medicine consumption'],
    response: () => 'Medicine usage this month: Tylosin — 48 units. Amprolium — 72 units. Sulphonamides — 35 units. Total cost: approximately ₹18,400.' },
  { triggers: ['vaccines due tomorrow', 'vaccination tomorrow', 'how many vaccines due'],
    response: () => 'Tomorrow, 3 vaccination tasks are due: 500 broilers for Gumboro IBD, 300 breeding flock for Fowl Pox, and 200 layers for Infectious Bronchitis.' },
  { triggers: ['worker most tasks', 'top worker', 'best worker tasks', 'most tasks completed'],
    response: () => 'This month, Kumar (ID: W-007) completed the most tasks — 48 out of 50 assigned. He has a 96 percent completion rate and is the best performer this month.' },

  // ── MODULE SUMMARIES ──
  { triggers: ['feed summary', 'feed details', 'tell me about feed', 'feed report'],
    response: () => "Feed Summary: Stock 2.5 Tons. Today's consumption 120 kg. Monthly 3.2 Tons. Low: Poultry Mix — reorder soon. Next delivery July 28th." },
  { triggers: ['animal summary', 'animal details', 'tell me about animals', 'animal report'],
    response: () => 'Animal Summary: Total 1,250. Healthy: 1,180. Sick: 6. Isolated: 20. Vaccinations due today: 18. Sold this month: 45.' },
  { triggers: ['medicine summary', 'medicine details', 'tell me about medicine', 'medicine report'],
    response: () => 'Medicine Summary: 350 units in stock. Near expiry: 12 batches. Today usage: 8 units. Expired: 2 — dispose immediately.' },
  { triggers: ['worker summary', 'worker details', 'tell me about workers', 'staff summary'],
    response: () => 'Worker Summary: 32 total. Present: 28. Absent: 2. On leave: 2. Attendance 87.5%. Pending tasks: 15.' },
  { triggers: ['biosecurity summary', 'biosecurity details', 'security summary'],
    response: () => "Biosecurity Summary: Visitors today: 5. Vehicles: 3. PPE compliance: 96%. Cleaning: done. Sanitization: pending." },

  // ── GENERAL ──
  { triggers: ['today farm summary', 'farm summary today', 'today summary'],
    response: () => "Today's farm summary: Animals 1,250 (1,180 healthy). Feed 2.5T. Workers 28/32 present. Vaccinations due: 18. Tasks pending: 15. Medicines expiring: 12 batches. All 10 sheds operational." },
  { triggers: ['weather', 'temperature', 'climate'],
    response: () => 'Weather: 24°C, partly cloudy. Humidity 65%. Wind 12 km/h.' },
  { triggers: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    response: () => 'Hello! I am Nava, your Farm AI Assistant. Ask me about animals, feed, workers, vaccinations, medicine, or any farm analytics!' },
  { triggers: ['help', 'what can you do', 'commands'],
    response: () => 'I can help with: Dashboard stats, Farm approvals, Reports, Animal health, Feed stock, Medicine inventory, Worker attendance, Vet commands, Worker tasks, and AI analytics questions. Just ask naturally!' },
  { triggers: ['summary', 'overview', 'full summary'],
    response: () => "Full summary: Animals 1,250 total, 1,180 healthy, 6 sick. Feed 2.5T. Workers 28/32. Vaccinations due: 18. Tasks: 15 pending. Medicines near expiry: 12." },
  { triggers: ['thank you', 'thanks', 'bye', 'goodbye'],
    response: () => 'You are welcome! Have a productive day. Call me anytime!' },
  { triggers: ['login info', 'credentials', 'email', 'password', 'login details'],
    response: () => 'You can log in as System Admin, Farm Owner, or Farm Manager using your registered email and password.' },
];

// ─── Navigation command map ──────────────────────────────────────────────────
const NAV_COMMANDS = [
  // Role switching
  { triggers: ['farm manager', 'manager dashboard', 'go to manager', 'open manager', 'manager portal', 'switch to farm manager', 'change role to farm manager', 'change role to manager', 'switch to manager', 'manager role', 'switch role to farm manager'], page: 'role-manager', label: 'Farm Manager Role', isRole: true, roleName: 'Farm Manager' },
  { triggers: ['farm admin', 'farm owner', 'farm dashboard', 'owner dashboard', 'switch to farm admin', 'change role to farm owner', 'switch to farm owner', 'farm owner portal', 'owner role'], page: 'role-owner', label: 'Farm Owner Role', isRole: true, roleName: 'Farm Owner' },
  { triggers: ['system admin', 'admin dashboard', 'switch to admin', 'change role to admin', 'admin portal', 'admin role', 'switch role to admin'], page: 'role-admin', label: 'System Admin Role', isRole: true, roleName: 'System Admin' },

  // Public pages
  { triggers: ['contact', 'contact page', 'contact us', 'go to contact', 'open contact'], page: 'contact', label: 'Contact' },
  { triggers: ['home', 'home page', 'homepage', 'go to home', 'open home'], page: 'home', label: 'Home' },
  { triggers: ['about', 'about page', 'about us', 'go to about', 'open about'], page: 'about', label: 'About Us' },
  { triggers: ['features', 'feature', 'features page', 'go to features', 'open features'], page: 'features', label: 'Features' },
  { triggers: ['login', 'log in', 'sign in', 'go to login', 'open login'], page: 'login', label: 'Login' },
  { triggers: ['register', 'signup', 'sign up', 'registration', 'go to register'], page: 'register', label: 'Registration' },

  // Manager module pages
  { triggers: ['dashboard page', 'go to dashboard', 'open dashboard', 'show dashboard', 'analytics dashboard'], page: 'dashboard', label: 'Dashboard' },
  { triggers: ['open animal list', 'go to animals', 'open animals', 'animal list', 'animal page'], page: 'animals', label: 'Animals' },
  { triggers: ['go to vaccinations', 'open vaccinations', 'vaccination center', 'vaccination page', 'animals due for vaccination'], page: 'vaccinations', label: 'Vaccinations' },
  { triggers: ['open disease records', 'go to disease', 'open disease', 'disease records', 'disease page'], page: 'disease', label: 'Disease & Treatment' },
  { triggers: ['go to feed', 'open feed', 'feed management', 'feed page', 'show feed consumption'], page: 'feed', label: 'Feed Management' },
  { triggers: ['go to medicine', 'open medicine', 'medicine management', 'medicine page'], page: 'medicine', label: 'Medicine Management' },
  { triggers: ['go to workers', 'open workers', 'worker page', 'worker management'], page: 'workers', label: 'Workers' },
  { triggers: ['go to attendance', 'open attendance', 'attendance page', 'mark attendance'], page: 'attendance', label: 'Attendance' },
  { triggers: ['go to sheds', 'open sheds', 'shed management', 'shed page'], page: 'sheds', label: 'Shed Management' },
  { triggers: ['go to biosecurity', 'open biosecurity', 'biosecurity page'], page: 'biosecurity', label: 'Biosecurity' },
  { triggers: ['show pending tasks', 'go to tasks', 'open tasks', 'task page', 'open today tasks'], page: 'tasks', label: 'Tasks' },
  { triggers: ['generate today report', 'go to reports', 'open reports', 'report page', 'generate report'], page: 'reports', label: 'Reports' },
  { triggers: ['go to notifications', 'open notifications', 'notification page', 'show alerts'], page: 'notifications', label: 'Notifications' },
  { triggers: ['go to profile', 'open profile', 'my profile', 'profile page'], page: 'profile', label: 'Profile' },
  { triggers: ['vet command center', 'veterinarian', 'go to vet', 'open vet', 'vet dashboard', 'open treatment history'], page: 'veterinarian', label: 'Vet Command Center' },
];

// ─── Tamil Commands ─────────────────────────────────────────────────────────
const TAMIL_COMMANDS = [
  { triggers: ['மொத்த விலங்குகள்', 'எத்தனை விலங்குகள்', 'கோழிகள் எத்தனை'],
    response: () => 'மொத்தம் 1,250 விலங்குகள் உள்ளன. 1,180 ஆரோக்கியமாக உள்ளன, 6 நோயுற்றன, 20 தனிமையில் உள்ளன.' },
  { triggers: ['தீவன இருப்பு', 'தீவனம் எவ்வளவு', 'தீவன அளவு'],
    response: () => 'தற்போதைய தீவன இருப்பு 2.5 டன். இன்றைய நுகர்வு 120 கிலோ. அடுத்த டெலிவரி ஜூலை 28.' },
  { triggers: ['நோயுற்ற விலங்குகள்', 'நோயுள்ள கோழிகள்', 'உடல்நலமற்ற விலங்கு'],
    response: () => 'தற்போது 6 விலங்குகள் நோயுற்றுள்ளன. 2 கோழிகள் குணமடைந்து வருகின்றன. ஷெட் 1-ல் சுவாச நோய் சந்தேகம்.' },
  { triggers: ['தொழிலாளர்கள்', 'ஆஜர் இன்று', 'எத்தனை பேர் வந்தனர்'],
    response: () => 'இன்று 32 பேரில் 28 பேர் ஆஜராக உள்ளனர். 2 பேர் வராமல் உள்ளனர். 2 பேர் விடுப்பில் உள்ளனர்.' },
  { triggers: ['தடுப்பூசி', 'வேக்சினேஷன்', 'தடுப்பூசி நிலுவை'],
    response: () => 'இன்று 18 விலங்குகளுக்கு தடுப்பூசி போட வேண்டியுள்ளது. உடனடியாக நடவடிக்கை எடுக்கவும்.' },
  { triggers: ['மருந்து இருப்பு', 'மருந்துகள் நிலை'],
    response: () => 'மொத்தம் 350 மருந்து யூனிட்கள் உள்ளன. 12 பேட்ச் காலாவதியாகிறது. 2 பேட்ச் ஏற்கனவே காலாவதியானது.' },
  { triggers: ['வணக்கம்', 'ஹலோ', 'நமஸ்காரம்'],
    response: () => 'வணக்கம்! நான் நவா, உங்கள் பண்ணை உதவியாளர். விலங்குகள், தீவனம், தொழிலாளர்கள் பற்றி கேளுங்கள்!' },
  { triggers: ['உதவி', 'என்ன செய்யலாம்'],
    response: () => 'நான் விலங்கு நிலை, தீவனம், மருந்து, தொழிலாளர் விவரங்கள், தடுப்பூசி பற்றி பதில் சொல்வேன்.' },
  { triggers: ['நன்றி', 'சரி', 'போதும்'],
    response: () => 'நன்றி! உற்பத்தி நிறைந்த நாளாக இருக்கட்டும். எப்போது வேண்டுமானாலும் கேளுங்கள்.' },
];

// ─── Hindi Commands ─────────────────────────────────────────────────────────
const HINDI_COMMANDS = [
  { triggers: ['कुल जानवर', 'कितने जानवर हैं', 'मुर्गियां कितनी हैं'],
    response: () => 'कुल 1,250 जानवर हैं। 1,180 स्वस्थ हैं, 6 बीमार हैं, 20 अलगाव में हैं।' },
  { triggers: ['चारा स्टॉक', 'चारा कितना है', 'फीड स्टॉक'],
    response: () => 'वर्तमान चारा स्टॉक 2.5 टन है। आज की खपत 120 किलो। अगली डिलीवरी 28 जुलाई को।' },
  { triggers: ['बीमार जानवर', 'बीमार मुर्गियां', 'अस्वस्थ जानवर'],
    response: () => 'अभी 6 जानवर बीमार हैं। 2 ठीक हो रहे हैं। शेड 1 में श्वसन रोग का संदेह है।' },
  { triggers: ['मजदूर', 'आज की उपस्थिति', 'कितने मजदूर आए'],
    response: () => 'आज 32 में से 28 मजदूर उपस्थित हैं। 2 अनुपस्थित हैं। 2 छुट्टी पर हैं।' },
  { triggers: ['टीकाकरण', 'वैक्सीन', 'टीका'],
    response: () => 'आज 18 जानवरों को टीकाकरण करना है। कृपया तुरंत कदम उठाएं।' },
  { triggers: ['दवाई स्टॉक', 'दवाएं', 'दवा भंडार'],
    response: () => 'कुल 350 दवाई यूनिट उपलब्ध हैं। 12 बैच एक्सपायर होने वाले हैं। 2 बैच पहले ही एक्सपायर हो गए।' },
  { triggers: ['आज का सारांश', 'खेत की जानकारी', 'फार्म रिपोर्ट'],
    response: () => 'आज का सारांश: 1,250 जानवर, 1,180 स्वस्थ। चारा 2.5 टन। 28/32 मजदूर उपस्थित। 18 टीके बाकी। 15 काम पेंडिंग।' },
  { triggers: ['नमस्ते', 'हेलो', 'नमस्कार'],
    response: () => 'नमस्ते! मैं नवा हूं, आपका फार्म सहायक। जानवर, चारा, मजदूर, दवाई के बारे में पूछें!' },
  { triggers: ['मदद', 'क्या कर सकते हो', 'सहायता'],
    response: () => 'मैं जानवरों की स्थिति, चारा स्टॉक, दवाई, मजदूर उपस्थिति और टीकाकरण के बारे में जानकारी दे सकता हूं।' },
  { triggers: ['धन्यवाद', 'शुक्रिया', 'ठीक है'],
    response: () => 'धन्यवाद! आपका दिन शुभ हो। कभी भी पूछें!' },
];

const LANG_CONFIG = {
  en: { code: 'en-US', label: 'EN', flag: '🇬🇧', greeting: "Hello! I'm Nava 🌾 Ask me anything about your farm!", commands: COMMANDS },
  ta: { code: 'ta-IN', label: 'தமிழ்', flag: '🇮🇳', greeting: 'வணக்கம்! நான் நவா 🌾 உங்கள் பண்ணை பற்றி கேளுங்கள்!', commands: TAMIL_COMMANDS },
  hi: { code: 'hi-IN', label: 'हिंदी', flag: '🇮🇳', greeting: 'नमस्ते! मैं नवा हूं 🌾 अपने खेत के बारे में पूछें!', commands: HINDI_COMMANDS },
};

const VoiceAssistant = ({ onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lang, setLang] = useState('en');
  const [chatLog, setChatLog] = useState([
    { type: 'bot', text: "Hello! I'm Nava, your Farm Manager Assistant 🌾 Ask me anything about your farm — animals, feed, workers, vaccinations, and more!", time: now() }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [inputText, setInputText] = useState('');

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  function now() {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  // Switch language — reinitialise recognition with correct lang code
  const switchLanguage = (newLang) => {
    setLang(newLang);
    const cfg = LANG_CONFIG[newLang];
    if (recognitionRef.current) recognitionRef.current.lang = cfg.code;
    setChatLog(prev => [...prev, { type: 'bot', text: cfg.greeting, time: now() }]);
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LANG_CONFIG[lang].code;

    recognition.onresult = (event) => {
      const interim = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(interim);

      if (event.results[event.results.length - 1].isFinal) {
        handleCommand(interim.trim());
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
  }, []);

  const handleCommand = useCallback((text) => {
    if (!text) return;
    let lower = text.toLowerCase().trim();

    // ── Robust wake word stripper (regex matches 'hey nava', 'hay nava', 'haey nava', 'hi nava', 'nava', 'nova', etc.) ──
    lower = lower.replace(/^(hey|hi|hello|haey|heay|hay|haye|yo|ok|okay)?\s*(nava|nova|navya|naava|nowa)\b\s*/i, '').trim();
    // Strip leading polite phrases/fillers/navigation verbs
    lower = lower.replace(/^(,|please|can you|could you|will you|just|kindly|show me|take me to|navigate to|open|go to|switch to|switch role to|change role to|change to|switch)\s+/gi, '').trim();

    // If text was just the wake word (e.g. "Hey Nava")
    if (!lower) {
      const msg = "Yes? How can I help you today?";
      setChatLog(prev => [...prev, { type: 'user', text, time: now() }, { type: 'bot', text: msg, time: now() }]);
      speak(msg);
      return;
    }

    // Add user message with original text
    setChatLog(prev => [...prev, { type: 'user', text, time: now() }]);

    // ── Check for LOGOUT first ──
    if (['logout', 'log out', 'sign out', 'log me out', 'exit'].some(t => lower.includes(t))) {
      const msg = 'Logging you out now. Goodbye! Have a great day.';
      setChatLog(prev => [...prev, { type: 'bot', text: msg, time: now() }]);
      speak(msg);
      setTimeout(() => { if (onLogout) onLogout(); }, 2000);
      return;
    }

    // ── Check for form filling (email, password) ──
    const passMatch = lower.match(/(?:enter|type|set|change|use)\s*(?:my)?\s*password\s+(?:to\s+|is\s+)?(.*)/i) || text.toLowerCase().match(/(?:enter|type|set|change|use)\s*(?:my)?\s*password\s+(?:to\s+|is\s+)?(.*)/i);
    if (passMatch) {
      let passRaw = passMatch[1].trim();
      passRaw = passRaw.replace(/\s+/g, '');
      const msg = `Entering password.`;
      setChatLog(prev => [...prev, { type: 'bot', text: msg, time: now() }]);
      speak(msg);
      window.dispatchEvent(new CustomEvent('voice-fill-password', { detail: passRaw }));
      return;
    }

    let emailRaw = '';
    const explicitEmailMatch = text.toLowerCase().match(/(?:enter|type|set|change|use)\s*(?:my)?\s*email\s+(?:to\s+|is\s+)?(.*)/i);
    if (explicitEmailMatch) {
      emailRaw = explicitEmailMatch[1].trim();
    } else if (text.includes('@') || text.toLowerCase().includes('gmail.com') || text.toLowerCase().includes('gmail')) {
      emailRaw = lower.split(' ').pop(); // take the last word, assuming it's the email
    }

    if (emailRaw) {
      emailRaw = emailRaw.replace(/\s+at\s+/gi, '@').replace(/\s+dot\s+/gi, '.').replace(/\s+/g, '').toLowerCase();
      if (!emailRaw.includes('@') && emailRaw.includes('gmail')) {
        emailRaw = emailRaw.replace('gmail', '@gmail');
      }
      const msg = `Entering email: ${emailRaw}`;
      setChatLog(prev => [...prev, { type: 'bot', text: msg, time: now() }]);
      speak(msg);
      window.dispatchEvent(new CustomEvent('voice-fill-email', { detail: emailRaw }));
      return;
    }

    const submitMatch = lower.match(/(?:click|submit|press)\s*(?:login|sign in|button)/i);
    if (submitMatch) {
      const msg = `Submitting login form.`;
      setChatLog(prev => [...prev, { type: 'bot', text: msg, time: now() }]);
      speak(msg);
      window.dispatchEvent(new CustomEvent('voice-submit-login'));
      return;
    }

    // ── Check for NAVIGATION commands ──
    const navMatch = NAV_COMMANDS.find(cmd =>
      cmd.triggers.some(t => lower.includes(t) || text.toLowerCase().includes(t))
    );
    if (navMatch) {
      const msg = navMatch.isRole 
        ? `Changing your role to ${navMatch.roleName} now.`
        : `Navigating to ${navMatch.label} page now.`;
      setChatLog(prev => [...prev, { type: 'bot', text: msg, time: now() }]);
      speak(msg);
      if (onNavigate) onNavigate(navMatch.page);
      return;
    }

    // ── Check info COMMANDS (active language first, then English fallback) ──
    const activeCmds = LANG_CONFIG[lang]?.commands || COMMANDS;
    const matched = activeCmds.find(cmd =>
      cmd.triggers.some(t => lower.includes(t))
    ) || (lang !== 'en' ? COMMANDS.find(cmd => cmd.triggers.some(t => lower.includes(t))) : null);

    const fallbacks = {
      en: `I'm not sure about "${text}". Try asking about feed, workers, vaccinations, or say "help".`,
      ta: `"${text}" புரியவில்லை. தீவனம், தொழிலாளர்கள், தடுப்பூசி பற்றி கேளுங்கள்.`,
      hi: `"${text}" समझ नहीं आया। चारा, मजदूर, टीकाकरण के बारे में पूछें।`,
    };
    const responseText = matched ? matched.response() : fallbacks[lang];

    setTimeout(() => {
      setChatLog(prev => [...prev, { type: 'bot', text: responseText, time: now() }]);
      speak(responseText);
    }, 400);
  }, [lang]);

  const speak = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      synthRef.current?.cancel();
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    handleCommand(inputText.trim());
    setInputText('');
  };

  const stopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title="Farm Voice Assistant"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
          width: '60px', height: '60px', borderRadius: '50%',
          background: isOpen ? '#ef4444' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          color: '#fff', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', boxShadow: '0 8px 25px rgba(79,70,229,0.4)',
          transition: 'all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
          transform: isOpen ? 'scale(1.1) rotate(45deg)' : 'scale(1)',
        }}>
        {isOpen ? <FaTimes /> : <FaRobot />}
      </button>

      {/* ── Pulse ring when listening ── */}
      {isListening && (
        <div style={{
          position: 'fixed', bottom: '1.85rem', right: '1.85rem', zIndex: 9998,
          width: '74px', height: '74px', borderRadius: '50%',
          border: '3px solid #ef4444', animation: 'pulse-ring 1.2s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* ── Chat Panel ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '6rem', right: '2rem', zIndex: 9998,
          width: '380px', maxHeight: '520px',
          background: '#fff', borderRadius: '20px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          border: '1px solid rgba(79,70,229,0.1)',
          animation: 'slideUp 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            padding: '1.1rem 1.5rem', color: '#fff',
            display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              <FaRobot />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>Nava (Farm Assistant)</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: isSpeaking ? '#fbbf24' : '#4ade80', display: 'inline-block', animation: isSpeaking ? 'pulse-dot 0.8s ease infinite' : 'none' }} />
                {isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Online'}
              </div>
            </div>
            {/* Language Switcher */}
            <div style={{ display: 'flex', gap: '0.3rem', marginRight: '0.25rem' }}>
              {Object.entries(LANG_CONFIG).map(([key, cfg]) => (
                <button key={key} onClick={() => switchLanguage(key)}
                  title={cfg.label}
                  style={{
                    background: lang === key ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                    color: lang === key ? '#4f46e5' : '#fff',
                    border: 'none', borderRadius: '6px',
                    padding: '0.2rem 0.45rem', fontSize: '0.65rem',
                    fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s',
                    letterSpacing: '0.02em'
                  }}>{cfg.label}</button>
              ))}
            </div>
            {isSpeaking && (
              <button onClick={stopSpeaking} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                <FaVolumeUp />
              </button>
            )}
          </div>

          {/* Live transcript bar */}
          {isListening && (
            <div style={{ background: '#fef3c7', padding: '0.5rem 1.25rem', fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'pulse-dot 0.8s ease infinite', display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              {transcript || 'Listening… speak now'}
            </div>
          )}

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#f8fafc' }}>
            {chatLog.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: msg.type === 'user' ? 'row-reverse' : 'row', gap: '0.5rem', alignItems: 'flex-end' }}>
                {msg.type === 'bot' && (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>
                    <FaRobot />
                  </div>
                )}
                <div style={{
                  maxWidth: '78%',
                  background: msg.type === 'user' ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : '#fff',
                  color: msg.type === 'user' ? '#fff' : '#111827',
                  padding: '0.65rem 1rem', borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.85rem', lineHeight: '1.5',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  border: msg.type === 'bot' ? '1px solid #e5e7eb' : 'none',
                }}>
                  {msg.text}
                  <div style={{ fontSize: '0.68rem', opacity: 0.55, marginTop: '0.25rem', textAlign: msg.type === 'user' ? 'right' : 'left' }}>{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestion chips */}
          <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', background: '#fff', borderTop: '1px solid #f1f5f9' }}>
            {['Total animals', 'Feed stock', 'Workers today', 'Vaccinations'].map(chip => (
              <button key={chip} onClick={() => handleCommand(chip)}
                style={{ background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '20px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.target.style.background = '#c7d2fe'}
                onMouseLeave={e => e.target.style.background = '#eef2ff'}>
                {chip}
              </button>
            ))}
          </div>

          {/* Input + mic */}
          <form onSubmit={handleTextSubmit} style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', background: '#fff', borderTop: '1px solid #e5e7eb' }}>
            <input
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={isSupported ? 'Type or use mic…' : 'Type your question…'}
              style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '25px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.875rem', background: '#f8fafc', color: '#111827' }}
            />
            {isSupported && (
              <button type="button" onClick={toggleListening}
                style={{
                  width: '42px', height: '42px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: isListening ? '#ef4444' : '#4f46e5', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                  flexShrink: 0, transition: 'background 0.2s',
                  boxShadow: isListening ? '0 0 0 4px rgba(239,68,68,0.25)' : 'none',
                }}>
                {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
              </button>
            )}
            <button type="submit"
              style={{ padding: '0.6rem 1rem', borderRadius: '25px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}>
              Send
            </button>
          </form>

          {!isSupported && (
            <div style={{ padding: '0.5rem 1rem', background: '#fef3c7', fontSize: '0.78rem', color: '#92400e', textAlign: 'center' }}>
              Voice input not supported in this browser. Use Chrome for best experience.
            </div>
          )}
        </div>
      )}

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default VoiceAssistant;
