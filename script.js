  /* ── Progress bar (fluide, sans jitter) ── */
  const pb  = document.getElementById('pbar');
  const nav = document.getElementById('nav');

  let pbTicking = false;

  function updateProgress() {
    pbTicking = false;

    const denom = (document.body.scrollHeight - window.innerHeight) || 1;
    let pct = window.scrollY / denom;
    // clamp 0..1
    if (pct < 0) pct = 0;
    if (pct > 1) pct = 1;

    if (pb) pb.style.transform = `scaleX(${pct})`;
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  }

  window.addEventListener('scroll', () => {
    if (!pbTicking) {
      pbTicking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });

  window.addEventListener('load', updateProgress);
/* ── Active nav ── */
const links = [...document.querySelectorAll('.nav-links a')];
const navEl  = document.getElementById('nav');
const secs   = [...document.querySelectorAll('section[id]')];
const contactEl = document.getElementById('contact');

function setActive(id){
  links.forEach(a => a.classList.remove('active'));
  const a = document.querySelector(`.nav-links a[href="#${id}"]`);
  if (a) a.classList.add('active');
}

let raf = null;
function updateActive(){
  raf = null;

  const navH = navEl ? navEl.offsetHeight : 68;
  const lineY = navH + 14;

  // 1) Priorité à CONTACT si le bloc est clairement dans la vue (même si c'est un div dans #competences)
  if (contactEl) {
    const r = contactEl.getBoundingClientRect();
    const visiblePx = Math.min(window.innerHeight, r.bottom) - Math.max(0, r.top);
    const visible = visiblePx > 0;
    // Active Contact dès qu'il est majoritairement visible OU que son haut passe dans la zone utile
    if (visible && (visiblePx >= Math.min(260, r.height * 0.55) || (r.top <= lineY && r.bottom > lineY))) {
      setActive('contact');
      return;
    }
  }

  // 2) Sinon, section active via la ligne sous la navbar
  let current = null;
  for (const s of secs){
    const r = s.getBoundingClientRect();
    if (r.top <= lineY && r.bottom > lineY) { current = s.id; break; }
  }
  if (current) setActive(current);
}

window.addEventListener('scroll', () => {
  if (raf) return;
  raf = requestAnimationFrame(updateActive);
}, { passive:true });

window.addEventListener('load', updateActive);

/* ── Fade-up ── */
  const fuObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); fuObs.unobserve(e.target); } });
  }, { threshold: 0.07, rootMargin: '0px 0px -35px 0px' });
  document.querySelectorAll('.fu').forEach(el => fuObs.observe(el));

  /* Hero visible immediately with stagger */
  document.querySelectorAll('#home .fu').forEach((el, i) => {
    setTimeout(() => el.classList.add('vis'), 60 + i * 85);
  });

  /* ── Skill bars (ordre: Développement → DevOps → Cybersécurité) ── */
  const skillsSec = document.getElementById('competences');
  let skillsAnimated = false;

  function animateSkillBarsOrdered() {
    if (skillsAnimated) return;
    skillsAnimated = true;

    const cards = [...document.querySelectorAll('#competences .sk-grid .sk-card')];
    let delay = 0;

    cards.forEach(card => {
      const bars = [...card.querySelectorAll('.bar-f')];

      bars.forEach((bar, i) => {
        const d = delay + i * 120;
        window.setTimeout(() => bar.classList.add('vis'), d);
      });

      // petit gap entre catégories
      delay += bars.length * 130 + 50;
    });
  }

  if (skillsSec) {
    const skillsObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        animateSkillBarsOrdered();
        skillsObs.disconnect();
      });
    }, { threshold: 0.25 });

    skillsObs.observe(skillsSec);
  }
/* ── Week accordion ── */
  function tw(hdr) {
    const wk     = hdr.parentElement;
    const isOpen = wk.classList.contains('open');
    document.querySelectorAll('.wk.open').forEach(w => w.classList.remove('open'));
    if (!isOpen) wk.classList.add('open');
  }

  /* ── CV download ── */
  // Pour activer : remplace href="#" par href="./cv.pdf" sur les boutons cvbtn1/2/3

  /* ── CV modal ── */
  const cvBtn   = document.getElementById('cvbtn');
  const cvModal = document.getElementById('cv-modal');
  const cvOv    = document.querySelector('#cv-modal .cv-overlay');


  const cvClose = document.querySelector('#cv-modal .cv-close');
function openCV() {
    if (!cvModal) return;
    cvModal.classList.add('active');
    cvModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCV() {
    if (!cvModal) return;
    cvModal.classList.remove('active');
    cvModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // if (cvBtn) {
  //   cvBtn.addEventListener('click', (e) => {
  //     e.preventDefault();
  //     openCV();
  //   });
  // }

  if (cvBtn) {
    cvBtn.addEventListener('click', (e) => {
      e.preventDefault();
  
      // 📱 Sur petit écran : ouvrir directement le CV
      if (window.innerWidth <= 768) {
        window.location.href = 'https://rynraab.github.io/myportfolio/CV.pdf';
        return;
      }
  
      // 💻 Sur PC : afficher l'aperçu dans le modal
      openCV();
    });
  }

  if (cvOv) cvOv.addEventListener('click', closeCV);
  if (cvClose) cvClose.addEventListener('click', closeCV);

  document.getElementById("contact-btn").addEventListener("click", function(e){
    e.preventDefault();

    const encoded = "cmJyYXlhbmUucHJvQGdtYWlsLmNvbQ=="; // ← ton email en base64
    const decoded = atob(encoded);

    window.location.href = "mailto:" + decoded;
  });

/* ── Fake terminal pop ── */
(() => {
  const pop = document.getElementById('term-pop');
  const codeEl = document.getElementById('term-code');
  if (!pop || !codeEl) return;

  const scenarios = [
    {
      cmd: "nmap -sC -sV -Pn -p- 10.10.10.10 -T4",
      outLines: [
        "Starting Nmap 7.95 ( https://nmap.org )",
        "Nmap scan report for 10.10.10.10",
        "PORT   STATE SERVICE VERSION",
        "22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu",
        "80/tcp open  http    nginx 1.18.0",
        "|_http-title: Landing Page",
        "|_http-server-header: nginx/1.18.0 (Ubuntu)"
      ]
    },
    {
      cmd: "nmap --script vuln -p 80,443 10.10.10.10",
      outLines: [
        "PORT    STATE SERVICE",
        "80/tcp  open  http",
        "| http-vuln-cve2017-5638:",
        "|   VULNERABLE",
        "|_  Apache Struts RCE (CVE-2017-5638) (simulated output)"
      ]
    },
    {
      cmd: "netexec smb 10.10.10.10 -u user -p 'Password123!'",
      outLines: [
        "SMB         10.10.10.10  445  DC01  [*] Windows 10.0 Build 17763 x64",
        "SMB         10.10.10.10  445  DC01  [+] user:Password123! (Pwn3d!)"
      ]
    },
    {
      cmd: "netexec winrm 10.10.10.10 -u user -p 'Password123!'",
      outLines: [
        "WINRM       10.10.10.10  5985 DC01  [+] user:Password123! (Valid credentials)"
      ]
    },
    {
      cmd: "ffuf -u http://10.10.10.10/FUZZ -w /usr/share/wordlists/dirb/common.txt -fc 404",
      outLines: [
        "admin           [Status: 301, Size: 0, Words: 1, Lines: 1]",
        "backup          [Status: 200, Size: 1248, Words: 210, Lines: 32]",
        "api             [Status: 200, Size: 512, Words: 40, Lines: 14]",
        "login           [Status: 200, Size: 980, Words: 120, Lines: 18]"
      ]
    },
    {
      cmd: "sqlmap -u \"http://10.10.10.10/item.php?id=1\" --batch --dbs",
      outLines: [
        "[*] testing connection to the target URL",
        "[+] parameter 'id' appears to be injectable",
        "[*] available databases [2]:",
        "[*] information_schema",
        "[*] appdb"
      ]
    },
    {
      cmd: "hydra -l admin -P rockyou.txt 10.10.10.10 http-post-form \"/login:username=^USER^&password=^PASS^:F=invalid\" -t 16",
      outLines: [
        "[80][http-post-form] host: 10.10.10.10   login: admin   password: admin123"
      ]
    }
  ];


  // Pick scenarios without repeating too often
  let pool = [];
  function shuffle(arr){
    for (let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function pickScenario(){
    if (pool.length === 0) pool = shuffle([...scenarios]);
    return pool.pop();
  }
const promptHTML = '<span class="prompt">raabryn@kali</span>:<span class="prompt">~</span>$ ';
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function show(){ pop.classList.remove('hide'); pop.classList.add('show'); }
  function hide(){ pop.classList.remove('show'); pop.classList.add('hide'); }

  function randomizePosition(){
    // Measure with visibility hidden so no user flash
    const prevVis = pop.style.visibility;
    pop.style.visibility = 'hidden';
    pop.classList.add('show');
    const rect = pop.getBoundingClientRect();
    pop.classList.remove('show');
    pop.style.visibility = prevVis || '';

    const w = rect.width || 420;
    const h = rect.height || 220;
    const pad = 18;
    const navSafe = 90;

    const maxX = Math.max(pad, window.innerWidth - w - pad);
    const maxY = Math.max(navSafe, window.innerHeight - h - pad);

    const x = pad + Math.random() * (maxX - pad);
    const y = navSafe + Math.random() * (maxY - navSafe);

    pop.style.left =  '580px';
    pop.style.top  = '200px';
  }

  async function typeCommand(cmd){
    codeEl.innerHTML = promptHTML + '<span class="cmd"></span><span class="cursor"></span>';
    const cmdEl = codeEl.querySelector('.cmd');
    const cursor = codeEl.querySelector('.cursor');

    for (const ch of cmd){
      cmdEl.textContent += ch;
      await sleep(10 + Math.random()*22);
    }
    cursor.remove();
    codeEl.innerHTML += "\n";
  }

  function addOutput(out){
    const safe = out.replace(/</g,"&lt;").replace(/>/g,"&gt;");
    codeEl.innerHTML += `<span class="out">${safe}</span>\n`;
  }

  let running = false;

  async function runOnce(){
    if (running) return;
    running = true;

    const s = pickScenario();
    randomizePosition();
    show();

    await sleep(120);
    await typeCommand(s.cmd);
    await sleep(1000);
    addOutput((s.outLines ? s.outLines.join("\n") : (s.out || "")));

    await sleep(5000);
    hide();
    await sleep(280);
    codeEl.textContent = "";
    running = false;
  }

  function schedule(){
    const next = 15000 + Math.random() * 20000; // 15-35s
    setTimeout(async () => {
      await runOnce();
      schedule();
    }, next);
  }

  window.addEventListener('load', () => {
    // first pop quickly so you see it
    setTimeout(runOnce, 1200);
    schedule();
  });

  // quick test: click logo to trigger
  const logo = document.querySelector('#nav .logo');
  if (logo) logo.addEventListener('click', (e) => { e.preventDefault(); runOnce(); });
})();

// Curseur personnalisé (halo néon)
const glow = document.querySelector('.cursor-glow');

if (glow && !matchMedia('(pointer: coarse)').matches) {
  glow.style.opacity = '0';

  window.addEventListener('mousemove', (e) => {
    glow.style.opacity = '1';
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  });

  window.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });

  // Effet au survol des éléments cliquables
  document.querySelectorAll('a, button, .btn, .tool, .wk-h').forEach(el => {
    el.addEventListener('mouseenter', () => {
      glow.style.width = '46px';
      glow.style.height = '46px';
      glow.style.margin = '-23px 0 0 -23px';
    });
    el.addEventListener('mouseleave', () => {
      glow.style.width = '26px';
      glow.style.height = '26px';
      glow.style.margin = '-13px 0 0 -13px';
    });
  });
} else if (glow) {
  glow.remove(); // pas de halo sur mobile/tactile
}
