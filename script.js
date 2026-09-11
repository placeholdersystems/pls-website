const ESTABLISHED            = "2025-09-23";
const UPTIME_PCT             = 99.9;
const MEMBER_COUNT           = "—";
const OPSTAT_API             = "https://script.google.com/macros/s/AKfycbwENqiIDpeiFs7-eYIi1EAW4dkPeGgK2ha3hR0zEWU3J_Jy6T9T6R7Zywu_kt6KuN_8Bw/exec";
const COUNTER_SITE1          = "https://script.google.com/macros/s/AKfycbwih3vOFwfK9ZdLqcHvyzLPg02hDx5sOTOB1GqP6ZtJtBubZXTwYQr9SEjUW7yzvShc4A/exec";
const COUNTER_SITE2_READONLY = "https://script.google.com/macros/s/AKfycbyXFTcX7kalhx2KhbYbf23SySEwn2FJdWu8OX9dX6r_hLoq1MBiMzVZ0vB8IP7ZG--x/exec";
const COUNTER_SITE3_READONLY = "https://script.google.com/macros/s/AKfycbzcgak-fj_XaxruiCBBxPpNeI3eUi19ZYkmVBzum0OWglolceDTCbpsxyIS0pZ9e-G70g/exec";

/* Cycling text */
const words = document.querySelectorAll('.cycle-word');
let cwCur = 0, cwDone = false;
words[0].classList.add('active');
function cwAdvance() {
  if (cwDone) return;
  words[cwCur].classList.remove('active');
  words[cwCur].classList.add('exit');
  const prev = cwCur++;
  words[cwCur].classList.add('active');
  setTimeout(() => words[prev].classList.remove('exit'), 600);
  if (cwCur < words.length - 1) setTimeout(cwAdvance, 1800);
  else cwDone = true;
}
setTimeout(cwAdvance, 1800);

/* Clock */
let is24h = false;
function updateClock() {
  const now = new Date();
  document.getElementById("pld-date-display").textContent = now.toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric", timeZone:"Asia/Singapore" });
  document.getElementById("pld-time-display").textContent = now.toLocaleTimeString("en-US", { hour:"numeric", minute:"numeric", second:"numeric", timeZone:"Asia/Singapore", hourCycle: is24h ? "h23" : "h12" });
}
document.getElementById("pld-time-toggle").addEventListener("click", () => { is24h = !is24h; updateClock(); });
updateClock(); setInterval(updateClock, 1000);

/* OPSTAT */
const LEVELS = {
  5:{name:"NORMAL",desc:"Response Time: 2 Days.",bg:"#00cc44"},
  4:{name:"MODERATE",desc:"Response Time: 14 Days.",bg:"#378ADD"},
  3:{name:"MEDIUM",desc:"Response Time: 14 Days.",bg:"#FFD700"},
  2:{name:"HIGH",desc:"Operations Temporarily Suspended.",bg:"#FF6B35"},
  1:{name:"CRITICAL",desc:"Operations Temporarily Suspended.",bg:"#ff0000"},
  0:{name:"NOT OPERATIONAL",desc:"Closed.",bg:"rgba(255,255,255,0.1)"}
};
let currentOPSTAT = null;
function renderOPSTAT(value) {
  currentOPSTAT = parseFloat(value);
  const band = Math.min(5, Math.max(0, Math.floor(currentOPSTAT)));
  const info = LEVELS[band]; const isDark = band === 0;
  const squares = document.querySelectorAll('.opstat-square');
  document.getElementById("opstatInfoBox").style.background = info.bg;
  document.getElementById("opstatLevelLabel").style.color = isDark ? "#fff" : "#000";
  document.getElementById("opstatNameLabel").style.color  = isDark ? "rgba(255,255,255,0.55)" : "#000";
  document.getElementById("opstatDescLabel").style.color  = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.7)";
  document.getElementById("opstatLevelLabel").textContent = "OPSTAT " + currentOPSTAT.toFixed(1);
  document.getElementById("opstatNameLabel").textContent  = info.name;
  document.getElementById("opstatDescLabel").textContent  = info.desc;
  squares.forEach(sq => { sq.classList.remove("glow"); if (parseInt(sq.dataset.band) === band) sq.classList.add("glow"); });
  positionIndicator(currentOPSTAT, squares);
  document.getElementById("lastUpdated").textContent = new Date().toLocaleTimeString("en-US", { timeZone:"Asia/Singapore", hour12:true });
  document.getElementById("fetchStatus").textContent = "";
}
function positionIndicator(value, squares) {
  const ind = document.getElementById("opstat-indicator");
  const con = document.querySelector(".opstat-bar-container");
  const arr = Array.from(squares); const cR = con.getBoundingClientRect();
  const fc = arr[0].getBoundingClientRect().left + arr[0].getBoundingClientRect().width/2 - cR.left;
  const lc = arr[arr.length-1].getBoundingClientRect().left + arr[arr.length-1].getBoundingClientRect().width/2 - cR.left;
  ind.style.left = (fc + ((5-value)/5)*(lc-fc)) + "px";
  ind.style.top  = (arr[0].getBoundingClientRect().top - cR.top - (ind.offsetHeight||26) - 8) + "px";
  ind.textContent = value.toFixed(1);
  const tc = document.getElementById("half-ticks"); tc.innerHTML = "";
  for (let i = 0; i < arr.length-1; i++) {
    const lR = arr[i].getBoundingClientRect(), rR = arr[i+1].getBoundingClientRect();
    const t = document.createElement("div"); t.className = "half-tick";
    t.style.left = ((lR.left+lR.width/2+rR.left+rR.width/2)/2 - cR.left) + "px";
    tc.appendChild(t);
  }
}
async function fetchOPSTAT() {
  try {
    const data = await fetch(OPSTAT_API).then(r => r.json());
    if (data.value !== undefined) renderOPSTAT(data.value);
    else document.getElementById("fetchStatus").textContent = "Unexpected data format.";
  } catch { document.getElementById("fetchStatus").textContent = "Could not reach server. Retrying…"; }
}
fetchOPSTAT(); setInterval(fetchOPSTAT, 30000);
window.addEventListener("resize", () => { if (currentOPSTAT !== null) renderOPSTAT(currentOPSTAT); });

/* Stats */
const estDate = new Date(ESTABLISHED);
document.getElementById("est-date").textContent     = estDate.toLocaleDateString("en-US", { month:"short", day:"numeric" });
document.getElementById("est-year").textContent     = estDate.getFullYear();
document.getElementById("uptime-val").textContent   = UPTIME_PCT.toFixed(1) + "%";
document.getElementById("member-count").textContent = MEMBER_COUNT;
document.getElementById("days-active").textContent  = Math.floor((new Date()-estDate)/86400000).toLocaleString();

fetch(COUNTER_SITE1).then(r=>r.text()).then(t=>{const n=parseInt(t.trim(),10);document.getElementById("counter-s1").textContent=isNaN(n)?"—":n.toLocaleString();}).catch(()=>{document.getElementById("counter-s1").textContent="—";});
fetch(COUNTER_SITE2_READONLY).then(r=>r.text()).then(t=>{const n=parseInt(t.trim(),10);document.getElementById("counter-s2").textContent=isNaN(n)?"—":n.toLocaleString();}).catch(()=>{document.getElementById("counter-s2").textContent="—";});
fetch(COUNTER_SITE3_READONLY).then(r=>r.text()).then(t=>{const n=parseInt(t.trim(),10);document.getElementById("counter-s3").textContent=isNaN(n)?"—":n.toLocaleString();}).catch(()=>{document.getElementById("counter-s3").textContent="—";});
function scrollToOpstat(e) {
  e.preventDefault();
  document.getElementById("opstat").scrollIntoView({ behavior: "smooth", block: "start" });
}