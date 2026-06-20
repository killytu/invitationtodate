/* ==========================================================================
   Date Invitation — logic
   ========================================================================== */

const BOT_TOKEN = "8752915536:AAFgTTqYKr_N43jo9O4sc9cf-KtxC4lt0g4";   
const CHAT_ID   = "803869840"; 
const BOT_API   = `https://api.telegram.org/bot8752915536:AAFgTTqYKr_N43jo9O4sc9cf-KtxC4lt0g4/sendMessage`;

/* ---- state ---------------------------------------------------------- */
const state = {
  mood:"", place:"", food:"", drink:"",
  beauty:"", surprise:"", excitement:50,
  date:"", time:""
};

const STEPS_RESTAURANT = ["step1","step2","step3","step4","step5","step6","step7","step8","step9"];
const STEPS_MOVIE      = ["step1","step2","step3","step5","step6","step7","step8","step9"];

let path = ["step1"];

const CONFETTI_COLORS = ["#C2496A","#832B45","#C2933C","#F7DDC9"];

/* ---- navigation -------------------------------------------------------- */
function activePathLength(){
  return state.place === "Кино" ? STEPS_MOVIE.length : STEPS_RESTAURANT.length;
}

function showStep(id){
  document.querySelectorAll(".step").forEach(s=>{
    s.classList.toggle("hidden", s.id !== id);
  });

  const seal = document.getElementById("seal");
  seal.classList.toggle("seal-lg", id === "step1" || id === "final");

  const showChrome = id !== "step1" && id !== "final";
  const stepMeta = document.getElementById("stepMeta");
  const progressTrack = document.getElementById("progressTrack");
  stepMeta.classList.toggle("chrome-hidden", !showChrome);
  progressTrack.classList.toggle("chrome-hidden", !showChrome);

  if (showChrome){
    const total = activePathLength();
    const idx = Math.min(path.length, total);
    document.getElementById("stepCounter").textContent = `Шаг ${idx} из ${total}`;
    document.getElementById("progressFill").style.width = `${Math.min(100, (idx/total)*100)}%`;
  }

  const el = document.getElementById(id);
  const heading = el.querySelector(".step-heading");
  if (heading) heading.focus({ preventScroll:false });
}

function goTo(id){
  path.push(id);
  showStep(id);
}

function goBack(){
  if (path.length <= 1) return;
  path.pop();
  showStep(path[path.length-1]);
}

function chooseYes(){
  burst(90, 0.65);
  goTo("step2");
}

function wireNoButtonDodge(){
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const wrap = noBtn.parentElement;
  const messages = [
    "Нет 🙈",
    "Точно? 👀",
    "Серьёзно? 😳",
    "Это финальный ответ? 🥺",
    "Ну пожалуйста 🥹",
    "Ладно, буду просто убегать 😅"
  ];
  let count = 0;

  function safeTopBound(){
    const wrapRect = wrap.getBoundingClientRect();
    const yesRect = yesBtn.getBoundingClientRect();
    return Math.max(0, (yesRect.bottom - wrapRect.top) + 10);
  }

  function placeAtRest(){
    const top = safeTopBound();
    noBtn.style.left = "50%";
    noBtn.style.top = `${top}px`;
    noBtn.style.transform = "translateX(-50%)";
  }

  function dodge(){
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = noBtn.getBoundingClientRect();
    const topBound = safeTopBound();
    const maxX = Math.max(0, wrapRect.width - btnRect.width);
    const maxY = Math.max(topBound, wrapRect.height - btnRect.height);

    const curLeft = parseFloat(noBtn.style.left) || 0;
    const curTop  = parseFloat(noBtn.style.top) || topBound;
    const minJump = Math.max(90, Math.min(maxX, maxY - topBound) * 0.6);

    let newX, newY, tries = 0;
    do{
      newX = Math.random()*maxX;
      newY = topBound + Math.random()*Math.max(0, maxY-topBound);
      tries++;
    } while (tries < 10 && Math.hypot(newX-curLeft, newY-curTop) < minJump);

    noBtn.style.transform = "none";
    noBtn.style.left = `${newX}px`;
    noBtn.style.top  = `${newY}px`;

    count = Math.min(count+1, messages.length-1);
    noBtn.textContent = messages[count];

    const scale = Math.min(1 + count*0.035, 1.25).toFixed(3);
    yesBtn.style.transform = `scale(${scale})`;
  }

  placeAtRest();
  noBtn.addEventListener("mouseenter", dodge);
  noBtn.addEventListener("focus", dodge);
  noBtn.addEventListener("touchstart", (e)=>{ e.preventDefault(); dodge(); }, { passive:false });
}

function markSelected(btn){
  const group = btn.parentElement;
  group.querySelectorAll(".option-btn").forEach(b=>b.classList.remove("selected"));
  btn.classList.add("selected");
}

function selectOption(btn, field, value, next){
  markSelected(btn);
  state[field] = value;
  setTimeout(()=> goTo(next), 320);
}

function selectPlace(btn, value){
  markSelected(btn);
  state.place = value;
  if (value !== "Ресторан") state.food = "";
  const next = value === "Ресторан" ? "step4" : "step5";
  setTimeout(()=> goTo(next), 320);
}
function captionForExcitement(v){
  if (v <= 20) return "Совсем чуть-чуть 😌";
  if (v <= 40) return "Есть интерес 🙂";
  if (v <= 60) return "Уже жду 😊";
  if (v <= 80) return "Считаю часы ⏳";
  return "Не могу дождаться! 🔥";
}

function wireRange(){
  const range = document.getElementById("range");
  const valueEl = document.getElementById("rangeValue");
  const captionEl = document.getElementById("rangeCaption");

  function update(){
    const v = Number(range.value);
    const caption = captionForExcitement(v);
    valueEl.textContent = v;
    captionEl.textContent = caption;
    range.style.setProperty("--range-progress", `${v}%`);
    range.setAttribute("aria-valuetext", `${v} из 100, ${caption}`);
    state.excitement = v;
  }

  range.addEventListener("input", update);
  update();
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

function getStartDate(){
  const today = new Date();
  today.setHours(0,0,0,0);
  let start = new Date(today.getFullYear(), 6, 1);
  if (start < today) start = new Date(today.getFullYear()+1, 6, 1);
  return start;
}

function buildDateOptions(){
  const grid = document.getElementById("dateGrid");
  const start = getStartDate();
  const dayFmt = new Intl.DateTimeFormat("ru-RU", { day:"numeric", month:"long" });
  const wdFmt  = new Intl.DateTimeFormat("ru-RU", { weekday:"short" });

  for (let i = 0; i < 7; i++){
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const dateLabel = dayFmt.format(d);
    const topLabel = capitalize(wdFmt.format(d));
    const fullLabel = `${topLabel}, ${dateLabel}`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn date-btn";
    btn.innerHTML = `<span class="date-weekday">${topLabel}</span><span class="date-num">${dateLabel}</span>`;
    btn.addEventListener("click", ()=>{
      markSelected(btn);
      state.date = fullLabel;
      checkStep9Ready();
    });
    grid.appendChild(btn);
  }
}

function wireTimeOptions(){
  document.querySelectorAll("#timeGrid .option-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      markSelected(btn);
      state.time = btn.textContent.trim();
      checkStep9Ready();
    });
  });
}

function checkStep9Ready(){
  document.getElementById("finishBtn").disabled = !(state.date && state.time);
}


const RECAP_FIELDS = [
  { icon:"✨", label:"Настроение", get: ()=> state.mood },
  { icon:"📍", label:"Место",      get: ()=> state.place },
  { icon:"🍽", label:"Еда",        get: ()=> state.food },
  { icon:"🥤", label:"Напиток",    get: ()=> state.drink },
  { icon:"😍", label:"Красивая",   get: ()=> state.beauty },
  { icon:"🎁", label:"Сюрпризы",   get: ()=> state.surprise },
  { icon:"⏳", label:"Ожидание",   get: ()=> `${state.excitement}/100` },
  { icon:"📅", label:"Дата",       get: ()=> state.date },
  { icon:"🕐", label:"Время",      get: ()=> state.time }
];

function escapeHtml(str){
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderRecap(){
  const recap = document.getElementById("recap");
  recap.innerHTML = RECAP_FIELDS
    .map(f => ({ ...f, value: f.get() }))
    .filter(f => f.value)
    .map(f => `
      <div class="recap-row">
        <span class="recap-label">${f.icon} ${f.label}</span>
        <span class="recap-leader"></span>
        <span class="recap-value">${escapeHtml(String(f.value))}</span>
      </div>`)
    .join("");
}

function buildMessageText(){
  const lines = ["💌 Ответ на приглашение", ""];
  if (state.mood) lines.push(`Настроение: ${state.mood}`);
  if (state.place) lines.push(`Место: ${state.place}`);
  if (state.food) lines.push(`Еда: ${state.food}`);
  if (state.drink) lines.push(`Напиток: ${state.drink}`);
  if (state.beauty) lines.push(`Красивая: ${state.beauty}`);
  if (state.surprise) lines.push(`Сюрпризы: ${state.surprise}`);
  lines.push(`Ожидание: ${state.excitement}/100`);
  if (state.date) lines.push(`Дата: ${state.date}`);
  if (state.time) lines.push(`Время: ${state.time}`);
  return lines.join("\n");
}

async function copyText(text, btn){
  try{
    await navigator.clipboard.writeText(text);
  }catch{
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  btn.textContent = "Скопировано ✓";
  setTimeout(()=>{ btn.textContent = "📋 Скопировать текст"; }, 2200);
}

async function sendToTelegram(text){
  const statusEl = document.getElementById("sendStatus");
  statusEl.innerHTML = `<span class="status-pill status-sending">✉️ Отправляю твой ответ…</span>`;

  try{
    const res = await fetch(BOT_API, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text })
    });
    if (!res.ok) throw new Error(`Telegram API responded ${res.status}`);
    statusEl.innerHTML = `<span class="status-pill status-ok">Ответ отправлен ✓</span>`;
  }catch(err){
    statusEl.innerHTML = `
      <span class="status-pill status-fail">Не получилось отправить автоматически 😅</span>
      <p class="status-hint">Скопируй текст ниже и отправь его вручную:</p>
      <button type="button" class="btn-secondary" id="copyBtn">📋 Скопировать текст</button>`;
    document.getElementById("copyBtn").addEventListener("click", (e)=> copyText(text, e.currentTarget));
  }
}

function finish(){
  goTo("final");
  renderRecap();
  burst(140, 0.55);
  sendToTelegram(buildMessageText());
}
function burst(particleCount, originY){
  if (typeof confetti === "function"){
    confetti({ particleCount, spread: 80, origin:{ y: originY }, colors: CONFETTI_COLORS });
  }
}

/* ---- init ------------------------------------------------------------------------*/
function init(){
  wireNoButtonDodge();
  buildDateOptions();
  wireTimeOptions();
  wireRange();
}
init();
