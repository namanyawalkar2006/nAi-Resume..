import {
  generateResume,
  generateCoverLetter,
  generateInterviewQuestions,
  analyzeATSDetailed,
  generateLinkedInSummary,
  analyzeSkillsGap,
  BASE_URL,
} from "../ai-engine/geminiService.js";

/* ======================================================
   STATE
   ====================================================== */
let currentStep = 0;
const TOTAL_STEPS = 7; // Design, Personal, Experience, Projects, Education, Skills, Job Target
let experienceEntries = [];
let projectEntries = [];
let educationEntries = [];
let generatedResume = null;
let interviewData = null;
let atsDetailedData = null;
let linkedInData = null;
let skillsGapData = null;

/* ======================================================
   DOM REFS
   ====================================================== */
const stepPanels    = () => document.querySelectorAll(".step-panel");
const progressSteps = () => document.querySelectorAll(".progress-step");
const progressLines = () => document.querySelectorAll(".progress-line");

/* ======================================================
   INIT
   ====================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Visual Effects
  initParticles();
  initCursorGlow();
  initTypewriter();
  initScrollReveals();
  initCounters();
  initTiltCard();
  initMagneticButtons();

  // Initialize Builder
  addExperienceEntry();
  addProjectEntry();
  addEducationEntry();

  // Wire Events
  wireNavButtons();
  initStrategySync();
  wireEntryButtons();
  wireResultButtonsSafe();
  wireSmoothScroll();
  wireNavbarScroll();
  wireHeroButtons();
  wireResultTabs();
  wireMobileMenu();

  // New features
  initTemplateSwitcher();
  initThemeToggle();
});

/* ======================================================
   VISUAL EFFECTS (Aesthetics & Animations)
   ====================================================== */

function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;
  document.addEventListener("mousemove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
  });
}

function initParticles() {
  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];
  const mouse = { x: null, y: null, radius: 100 };

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    init();
  }
  window.addEventListener("resize", resize);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.5 + 0.5;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 20 + 5;
      this.vx = (Math.random() - 0.5) * 0.5;
      this.vy = (Math.random() - 0.5) * 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx = -this.vx;
      if (this.y < 0 || this.y > height) this.vy = -this.vy;

      if (mouse.x != null && mouse.y != null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance;
        let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        let directionX = forceDirectionX * force * this.density;
        let directionY = forceDirectionY * force * this.density;

        if (distance < mouse.radius) {
          this.x -= directionX;
          this.y -= directionY;
        }
      }
    }
    draw() {
      ctx.fillStyle = "rgba(99, 102, 241, 0.4)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    let numParticles = (width * height) / 10000;
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    connect();
    requestAnimationFrame(animate);
  }

  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
      for (let b = a; b < particles.length; b++) {
        let dx = particles[a].x - particles[b].x;
        let dy = particles[a].y - particles[b].y;
        let distance = dx * dx + dy * dy;
        if (distance < (canvas.width / 15) * (canvas.height / 15)) {
          opacityValue = 1 - distance / 10000;
          ctx.strokeStyle = `rgba(99, 102, 241, ${opacityValue * 0.1})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  resize();
  animate();
}

function initTypewriter() {
  const textEl = document.getElementById("typewriter-text");
  if (!textEl) return;
  const words = ["Resume in Seconds", "Cover Letter Today", "Interview Ready", "Dream Job Fast"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentWord = words[wordIndex];
    if (isDeleting) {
      textEl.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 50;
    } else {
      textEl.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2000; // Pause at end of word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 500; // Pause before next word
    }

    setTimeout(type, typingSpeed);
  }
  
  // Start after a slight delay
  setTimeout(type, 1000);
}

function initScrollReveals() {
  const reveals = document.querySelectorAll(".reveal-up");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  reveals.forEach(el => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll(".counter");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = +entry.target.getAttribute("data-target");
        animateValue(entry.target, 0, target, 2000);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));
}

function animateValue(obj, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    // easing out
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function initTiltCard() {
  const card = document.getElementById("hero-tilt-card");
  if (!card) return;
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max tilt 10deg
    const rotateY = ((x - centerX) / centerX) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  });
}

function initMagneticButtons() {
  const btns = document.querySelectorAll('.magnetic-btn');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });
}

function wireMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  
  if(hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("hidden");
    });

    document.querySelectorAll(".mobile-link").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.add("hidden");
      });
    });

    document.getElementById("mobile-start-btn")?.addEventListener("click", () => {
      hamburger.classList.remove("active");
      mobileMenu.classList.add("hidden");
      document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
    });
  }
}

/* ======================================================
   NAVIGATION
   ====================================================== */
function wireNavButtons() {
  document.getElementById("next-btn").addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < TOTAL_STEPS - 1) goToStep(currentStep + 1);
  });
  document.getElementById("prev-btn").addEventListener("click", () => {
    if (currentStep > 0) goToStep(currentStep - 1);
  });
}

function goToStep(step) {
  stepPanels()[currentStep].classList.remove("active");
  progressSteps()[currentStep].classList.remove("active");
  progressSteps()[currentStep].classList.add("done");

  if (step > currentStep) {
    Array.from(progressLines())[currentStep]?.classList.add("done");
  } else {
    Array.from(progressLines())[currentStep - 1]?.classList.remove("done");
    progressSteps()[currentStep].classList.remove("done");
  }

  currentStep = step;

  stepPanels()[currentStep].classList.add("active");
  progressSteps()[currentStep].classList.remove("done");
  progressSteps()[currentStep].classList.add("active");

  document.getElementById("prev-btn").disabled = currentStep === 0;
  document.getElementById("step-counter").textContent = `Step ${currentStep + 1} of ${TOTAL_STEPS}`;

  document.getElementById("next-btn").style.display = currentStep === TOTAL_STEPS - 1 ? "none" : "";

  document.getElementById("builder").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ======================================================
   VALIDATION
   ====================================================== */
function validateStep(step) {
  if (step === 0) return true; // Strategy step always valid
  if (step === 1) {
    const name  = document.getElementById("full-name").value.trim();
    const email = document.getElementById("email").value.trim();
    if (!name)  { showToast("Full name is required.", "error");  return false; }
    if (!email) { showToast("Email is required.", "error"); return false; }
    return true;
  }
  return true;
}

/* ======================================================
   EXPERIENCE ENTRIES
   ====================================================== */
function addExperienceEntry() {
  const id = Date.now();
  experienceEntries.push(id);
  const container = document.getElementById("experience-entries");
  const el = document.createElement("div");
  el.className = "entry-card render-animation";
  el.id = `exp-${id}`;
  el.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-title">Position ${experienceEntries.length}</span>
      <button class="btn-remove-entry magnetic-btn" onclick="removeEntry('exp-${id}', ${id}, 'exp')" aria-label="Remove">
        <svg viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Job Title</label>
        <input type="text" class="form-input" data-field="title" placeholder="Software Engineer" />
      </div>
      <div class="form-group">
        <label class="form-label">Company</label>
        <input type="text" class="form-input" data-field="company" placeholder="Acme Corp" />
      </div>
      <div class="form-group">
        <label class="form-label">Location</label>
        <input type="text" class="form-input" data-field="location" placeholder="San Francisco, CA / Remote" />
      </div>
      <div class="form-group">
        <label class="form-label">Start Date</label>
        <input type="text" class="form-input" data-field="startDate" placeholder="Jan 2022" />
      </div>
      <div class="form-group">
        <label class="form-label">End Date</label>
        <input type="text" class="form-input" data-field="endDate" placeholder="Dec 2024" />
        <div class="current-job-toggle">
          <input type="checkbox" id="current-${id}" data-field="current" />
          <label for="current-${id}">Currently working here</label>
        </div>
      </div>
      <div class="form-group full-width">
        <label class="form-label">Key Responsibilities / Achievements</label>
        <textarea class="form-textarea" data-field="description" rows="4"
          placeholder="Describe your main responsibilities and achievements. The AI will transform these into powerful bullet points.&#10;&#10;Example: Built a microservices architecture that reduced load time by 40%. Led a team of 5 engineers..."></textarea>
      </div>
    </div>
  `;
  container.appendChild(el);
  initMagneticButtons(); // Re-bind magnetic effect to new elements
}

/* ======================================================
   EDUCATION ENTRIES
   ====================================================== */
function addEducationEntry() {
  const id = Date.now();
  educationEntries.push(id);
  const container = document.getElementById("education-entries");
  const el = document.createElement("div");
  el.className = "entry-card render-animation";
  el.id = `edu-${id}`;
  el.innerHTML = `
    <div class="entry-card-header">
      <span class="entry-card-title">Degree ${educationEntries.length}</span>
      <button class="btn-remove-entry magnetic-btn" onclick="removeEntry('edu-${id}', ${id}, 'edu')" aria-label="Remove">
        <svg viewBox="0 0 24 24" fill="none"><path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Degree</label>
        <input type="text" class="form-input" data-field="degree" placeholder="Bachelor of Science" />
      </div>
      <div class="form-group">
        <label class="form-label">Field of Study</label>
        <input type="text" class="form-input" data-field="field" placeholder="Computer Science" />
      </div>
      <div class="form-group">
        <label class="form-label">Institution</label>
        <input type="text" class="form-input" data-field="institution" placeholder="University of Technology" />
      </div>
      <div class="form-group">
        <label class="form-label">Graduation Year</label>
        <input type="text" class="form-input" data-field="graduationYear" placeholder="2022" />
      </div>
      <div class="form-group">
        <label class="form-label">GPA (optional)</label>
        <input type="text" class="form-input" data-field="gpa" placeholder="3.8 / 4.0" />
      </div>
    </div>
  `;
  container.appendChild(el);
  initMagneticButtons();
}

function removeEntry(elId, id, type) {
  const el = document.getElementById(elId);
  if(el) {
    el.style.opacity = '0';
    el.style.transform = 'scale(0.9)';
    setTimeout(() => {
      el.remove();
      if (type === "exp") experienceEntries = experienceEntries.filter(i => i !== id);
      else if (type === "proj") projectEntries = projectEntries.filter(i => i !== id);
      else educationEntries = educationEntries.filter(i => i !== id);
    }, 300);
  }
}

function wireEntryButtons() {
  document.getElementById("add-experience-btn").addEventListener("click", addExperienceEntry);
  document.getElementById("add-project-btn").addEventListener("click", addProjectEntry);
  document.getElementById("add-education-btn").addEventListener("click", addEducationEntry);
}

function addProjectEntry() {
  const container = document.getElementById("project-entries");
  if (!container) return;
  const id = Date.now().toString();
  projectEntries.push(id);
  const el = document.createElement("div");
  el.className = "entry-card fade-in";
  el.id = `project-${id}`;
  el.innerHTML = `
    <div class="entry-header">
      <h4 class="entry-title">Project Details</h4>
      <button class="btn-remove" onclick="removeEntry('project-${id}', '${id}', 'proj')">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="form-grid">
      <div class="form-group">
        <label class="form-label">Project Title</label>
        <input type="text" class="form-input" data-field="title" placeholder="AI Resume Builder" />
      </div>
      <div class="form-group">
        <label class="form-label">Link (Optional)</label>
        <input type="text" class="form-input" data-field="link" placeholder="github.com/yourname/project" />
      </div>
      <div class="form-group full-width">
        <label class="form-label">Project Description</label>
        <textarea class="form-textarea" data-field="description" rows="3" placeholder="Describe what you built and the technologies used..."></textarea>
      </div>
    </div>
  `;
  container.appendChild(el);
}

function quickFillProjects() {
  const container = document.getElementById("project-entries");
  container.innerHTML = "";
  projectEntries = [];
  addProjectEntry();
  const first = container.querySelector(".entry-card");
  first.querySelector('[data-field="title"]').value = "Next-Gen E-Commerce Platform";
  first.querySelector('[data-field="link"]').value = "https://github.com/johndoe/shop-pro";
  first.querySelector('[data-field="description"]').value = "Built a high-performance e-commerce engine using React, Node.js, and Stripe API. Reduced page load times by 40% using server-side rendering.";
  showToast("Example project added! ✨", "info");
}

/* ======================================================
   DATA COLLECTION
   ====================================================== */
function collectExperience() {
  return Array.from(document.querySelectorAll("#experience-entries .entry-card")).map(card => ({
    title:       card.querySelector('[data-field="title"]')?.value.trim()       || "",
    company:     card.querySelector('[data-field="company"]')?.value.trim()     || "",
    location:    card.querySelector('[data-field="location"]')?.value.trim()    || "",
    startDate:   card.querySelector('[data-field="startDate"]')?.value.trim()   || "",
    endDate:     card.querySelector('[data-field="endDate"]')?.value.trim()     || "",
    current:     card.querySelector('[data-field="current"]')?.checked          || false,
    description: card.querySelector('[data-field="description"]')?.value.trim() || "",
  })).filter(e => e.title || e.company);
}

function collectEducation() {
  return Array.from(document.querySelectorAll("#education-entries .entry-card")).map(card => ({
    degree:         card.querySelector('[data-field="degree"]')?.value.trim()         || "",
    field:          card.querySelector('[data-field="field"]')?.value.trim()          || "",
    institution:    card.querySelector('[data-field="institution"]')?.value.trim()    || "",
    graduationYear: card.querySelector('[data-field="graduationYear"]')?.value.trim() || "",
    gpa:            card.querySelector('[data-field="gpa"]')?.value.trim()            || "",
  })).filter(e => e.degree || e.institution);
}

function collectUserData() {
  const toArr = str => str.split(",").map(s => s.trim()).filter(Boolean);
  return {
    fullName:          document.getElementById("full-name").value.trim(),
    email:             document.getElementById("email").value.trim(),
    phone:             document.getElementById("phone").value.trim(),
    location:          document.getElementById("location").value.trim(),
    linkedin:          document.getElementById("linkedin").value.trim(),
    portfolio:         document.getElementById("portfolio").value.trim(),
    yearsOfExperience: document.getElementById("years-exp").value.trim(),
    experience:        collectExperience(),
    projects:          collectProjects(),
    education:         collectEducation(),
    skills: {
      technical: toArr(document.getElementById("technical-skills").value),
      soft:      toArr(document.getElementById("soft-skills").value),
      tools:     toArr(document.getElementById("tools-skills").value),
    },
    certifications: toArr(document.getElementById("certifications").value),
    topSkills:      toArr(document.getElementById("technical-skills").value).slice(0, 5),
    targetRole:     document.getElementById("target-role").value.trim(),
    genMode:        document.querySelector('input[name="gen-mode"]:checked')?.value || "enhance",
    tone:           document.querySelector('input[name="resume-tone"]:checked')?.value || "ats",
  };
}

function collectProjects() {
  return Array.from(document.querySelectorAll("#project-entries .entry-card")).map(card => ({
    title:       card.querySelector('[data-field="title"]')?.value.trim()       || "",
    link:        card.querySelector('[data-field="link"]')?.value.trim()        || "",
    description: card.querySelector('[data-field="description"]')?.value.trim() || "",
  })).filter(p => p.title);
}

/* ======================================================
   GENERATE
   ====================================================== */
async function handleGenerate() {
  const jobDesc = document.getElementById("job-description").value.trim();
  if (!document.getElementById("target-role").value.trim()) {
    showToast("Please enter a target job title.", "error");
    return;
  }

  const userData = collectUserData();

  // Reset previous analysis
  interviewData = atsDetailedData = linkedInData = skillsGapData = null;

  showLoading(true);
  animateLoadingSteps();

  try {
    const resume = await generateResume(userData, jobDesc);
    generatedResume = resume;
    showLoading(false);
    renderResult(resume);
    showToast("Resume generated! Running full analysis… ✨", "success");

    // Fire all background analyses in parallel
    runBackgroundAnalysis(userData, jobDesc, resume);
  } catch (err) {
    showLoading(false);
    console.error(err);
    showToast("Error: " + (err.message || "Generation failed. Please try again."), "error");
  }
}

async function runBackgroundAnalysis(userData, jobDesc, resume) {
  const [interviewRes, atsRes, linkedInRes, gapRes] = await Promise.allSettled([
    generateInterviewQuestions(userData, jobDesc),
    analyzeATSDetailed(resume, jobDesc),
    generateLinkedInSummary(userData, userData.targetRole),
    analyzeSkillsGap(userData, jobDesc),
  ]);

  if (interviewRes.status === "fulfilled") {
    interviewData = interviewRes.value;
    updateInterviewTab(interviewData);
  } else {
    showTabError("tab-interview", "Interview questions failed to load.");
  }

  if (atsRes.status === "fulfilled") {
    atsDetailedData = atsRes.value;
    updateATSTab(atsDetailedData);
  } else {
    showTabError("tab-ats", "ATS analysis failed to load.");
  }

  if (linkedInRes.status === "fulfilled") {
    linkedInData = linkedInRes.value;
    updateLinkedInTab(linkedInData);
  } else {
    showTabError("tab-linkedin", "LinkedIn summary failed to load.");
  }

  if (gapRes.status === "fulfilled") {
    skillsGapData = gapRes.value;
    updateSkillsGapTab(skillsGapData);
  } else {
    showTabError("tab-skills-gap", "Skills gap analysis failed to load.");
  }
}

/* ======================================================
   LOADING
   ====================================================== */
function showLoading(show) {
  const overlay = document.getElementById("loading-overlay");
  if(show) {
    overlay.classList.remove("hidden");
    overlay.style.opacity = '0';
    requestAnimationFrame(() => overlay.style.opacity = '1');
  } else {
    overlay.style.opacity = '0';
    setTimeout(() => overlay.classList.add("hidden"), 300);
  }
}

function animateLoadingSteps() {
  const steps = ["ls-1", "ls-2", "ls-3", "ls-4"];
  const dots = steps.map(id => document.querySelector(`#${id} .ls-dot`));
  const progressFill = document.getElementById("loading-progress-fill");
  
  dots.forEach(d => d && (d.className = "ls-dot pending"));
  progressFill.style.width = "0%";
  
  steps.forEach((_, i) => {
    setTimeout(() => { 
      dots[i] && (dots[i].className = "ls-dot active"); 
      progressFill.style.width = `${(i + 1) * 25}%`;
    }, i * 2500);
    setTimeout(() => { 
      dots[i] && (dots[i].className = "ls-dot done");   
    }, i * 2500 + 2000);
  });
}

/* ======================================================
   RESULT TABS
   ====================================================== */
function wireResultTabs() {
  document.querySelectorAll(".result-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tabId) {
  document.querySelectorAll(".result-tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add("active");
  document.getElementById(`tab-${tabId}`)?.classList.add("active");
}

function showTabLoading(tabId) {
  const panel = document.getElementById(tabId);
  if (panel) {
    panel.innerHTML = `
      <div class="tab-loading">
        <div class="mini-loader"></div>
        <p>AI is analyzing<span class="animated-gradient" style="background-clip:text;-webkit-background-clip:text;color:transparent;">...</span></p>
      </div>`;
  }
}

function showTabError(tabId, msg) {
  const panel = document.getElementById(tabId);
  if (panel) panel.innerHTML = `<div class="tab-error">⚠️ ${msg}</div>`;
}

/* ======================================================
   RENDER RESULT (Resume tab)
   ====================================================== */
function renderResult(resume) {
  const resultSection = document.getElementById("result-section");
  resultSection.classList.remove("hidden");
  
  // Stagger reveal animations for result elements
  const reveals = resultSection.querySelectorAll('.reveal-up');
  reveals.forEach(el => el.classList.remove('revealed'));
  requestAnimationFrame(() => {
    reveals.forEach((el, index) => {
      setTimeout(() => el.classList.add('revealed'), index * 100);
    });
  });

  resultSection.scrollIntoView({ behavior: "smooth" });

  // ATS Score circle
  const score = resume.atsScore || 92;
  animateValue(document.getElementById("ats-score-num"), 0, score, 1500);
  document.getElementById("ats-score-desc").textContent =
    score >= 90 ? "Excellent! Ready to beat any ATS." :
    score >= 80 ? "Good score. Approved by most ATS." :
    "Moderate. Add more job keywords.";

  setTimeout(() => {
    const circle = document.getElementById("score-circle");
    if(circle) circle.style.strokeDashoffset = 314 - 314 * (Math.min(score, 100) / 100);
  }, 300);

  // Keywords
  const kList = document.getElementById("keywords-list");
  kList.innerHTML = "";
  (resume.keywords_used || []).slice(0, 16).forEach(kw => {
    const tag = document.createElement("span");
    tag.className = "keyword-tag";
    tag.textContent = kw;
    kList.appendChild(tag);
  });

  // Improvements
  const iList = document.getElementById("improvements-list");
  iList.innerHTML = "";
  (resume.improvements_made || []).slice(0, 6).forEach(imp => {
    const li = document.createElement("li");
    li.textContent = imp;
    iList.appendChild(li);
  });

  // Resume HTML
  const resumeDoc = document.getElementById("resume-document");
  resumeDoc.innerHTML = buildResumeHTML(resume);
  resumeDoc.className = `resume-theme-${activeTemplate}`;

  // Enable inline editing on the rendered document
  setTimeout(() => enableInlineEditing(), 400);

  // Switch to resume tab and show loading state on others
  switchTab("resume");
  showToast("✅ Resume generated! Click any text to edit it live.", "success");
  showTabLoading("tab-ats");
  showTabLoading("tab-interview");
  showTabLoading("tab-skills-gap");
  showTabLoading("tab-linkedin");
}

/* ======================================================
   UPDATE TABS
   ====================================================== */
function updateInterviewTab(data) {
  const panel = document.getElementById("tab-interview");
  if (!panel || !data) return;

  const behavioral = data.behavioral || [];
  const technical  = data.technical  || [];

  let html = '<div class="interview-grid">';

  if (behavioral.length) {
    html += `<div class="interview-section-label">🧠 Behavioral Questions</div>`;
    behavioral.forEach((q, i) => {
      html += interviewCard(q, i + 1, "behavioral");
    });
  }

  if (technical.length) {
    html += `<div class="interview-section-label">⚙️ Technical / Role-Specific Questions</div>`;
    technical.forEach((q, i) => {
      html += interviewCard(q, behavioral.length + i + 1, "technical");
    });
  }

  html += "</div>";
  panel.innerHTML = html;
}

function interviewCard(q, num, type) {
  return `
    <div class="interview-card">
      <div class="interview-q-num">Q${num}</div>
      <div class="interview-tag ${type}">${type === "behavioral" ? "Behavioral" : "Technical"}</div>
      <div class="interview-question">${escHtml(q.question)}</div>
      <div class="interview-meta">
        <div class="interview-why"><strong>💡 Why asked:</strong> ${escHtml(q.why)}</div>
        <div class="interview-tip"><strong>✅ How to answer:</strong> ${escHtml(q.tip)}</div>
        <details class="interview-sample-toggle">
          <summary>See sample answer</summary>
          <div class="interview-sample">${escHtml(q.sampleAnswer)}</div>
        </details>
      </div>
    </div>`;
}

function updateATSTab(data) {
  const panel = document.getElementById("tab-ats");
  if (!panel || !data) return;

  const cats = data.categories || {};
  const catOrder = ["keywords", "skills", "format", "experience", "education"];
  const catMeta = {
    keywords:   { label: "Keywords Match",      icon: "🔑" },
    skills:     { label: "Skills Relevance",    icon: "⚡" },
    format:     { label: "Format & Structure",  icon: "📋" },
    experience: { label: "Experience Match",    icon: "💼" },
    education:  { label: "Education Match",     icon: "🎓" },
  };

  let html = `
    <div class="ats-detailed">
      <div class="ats-overall">
        <div class="ats-overall-score">${data.overallScore ?? "--"}</div>
        <div class="ats-overall-label">Overall ATS Score</div>
      </div>
      <div class="ats-categories">`;

  catOrder.forEach(key => {
    const cat = cats[key];
    if (!cat) return;
    const pct = Math.round((cat.score / cat.max) * 100);
    html += `
      <div class="ats-cat-item">
        <div class="ats-cat-header">
          <span>${catMeta[key]?.icon} ${catMeta[key]?.label || key}</span>
          <span class="ats-cat-score">${cat.score}/${cat.max}</span>
        </div>
        <div class="ats-bar-track">
          <div class="ats-bar-fill" style="width:0%" data-target="${pct}"></div>
        </div>
        <div class="ats-cat-feedback">${escHtml(cat.feedback || "")}</div>
      </div>`;
  });

  html += `</div>`;

  // Keyword analysis
  if (data.matchedKeywords?.length || data.missingKeywords?.length) {
    html += `<div class="keywords-analysis">`;
    if (data.matchedKeywords?.length) {
      html += `<div class="kw-group">
        <div class="kw-group-label">✅ Keywords Found</div>
        <div class="kw-tags">${data.matchedKeywords.map(k => `<span class="kw-tag matched">${escHtml(k)}</span>`).join("")}</div>
      </div>`;
    }
    if (data.missingKeywords?.length) {
      html += `<div class="kw-group">
        <div class="kw-group-label">❌ Missing Keywords</div>
        <div class="kw-tags">${data.missingKeywords.map(k => `<span class="kw-tag missing">${escHtml(k)}</span>`).join("")}</div>
      </div>`;
    }
    html += `</div>`;
  }

  // Recommendations
  if (data.topRecommendations?.length) {
    html += `<div class="ats-recommendations">
      <div class="rec-title">🎯 Top Recommendations</div>
      <ul>${data.topRecommendations.map(r => `<li>${escHtml(r)}</li>`).join("")}</ul>
    </div>`;
  }

  // Passed checks
  if (data.passedChecks?.length) {
    html += `<div class="ats-passed">
      <div class="rec-title">✅ Passed Checks</div>
      <ul>${data.passedChecks.map(c => `<li>${escHtml(c)}</li>`).join("")}</ul>
    </div>`;
  }

  html += `</div>`;
  panel.innerHTML = html;

  // Animate bars
  requestAnimationFrame(() => {
    panel.querySelectorAll(".ats-bar-fill").forEach(bar => {
      const target = bar.dataset.target;
      setTimeout(() => { bar.style.width = target + "%"; }, 100);
    });
  });
}

function updateLinkedInTab(text) {
  const panel = document.getElementById("tab-linkedin");
  if (!panel || !text) return;

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  panel.innerHTML = `
    <div class="linkedin-container">
      <div class="linkedin-header">
        <svg viewBox="0 0 24 24" fill="#0077B5" width="36" height="36">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
        <div>
          <h3>LinkedIn About Section</h3>
          <p>Optimized for search visibility &amp; recruiter engagement</p>
        </div>
      </div>
      <div class="linkedin-text" id="linkedin-text">${escHtml(text)}</div>
      <div class="linkedin-actions">
        <button class="btn-secondary magnetic-btn" id="copy-linkedin-btn">
          <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Copy to Clipboard
        </button>
        <span class="word-count">${wordCount} words</span>
      </div>
    </div>`;

  document.getElementById("copy-linkedin-btn")?.addEventListener("click", () => {
    navigator.clipboard.writeText(text).then(() => showToast("LinkedIn summary copied! 📋", "success"));
  });
  
  // Run magnetic button init on new element
  initMagneticButtons();
}

function updateSkillsGapTab(data) {
  const panel = document.getElementById("tab-skills-gap");
  if (!panel || !data) return;

  let html = `
    <div class="skills-gap-container">
      <div class="match-score-banner">
        <div class="match-score-num">${data.matchScore ?? "--"}%</div>
        <div class="match-score-label">Job Match Score</div>
        <div class="match-bar-track">
          <div class="match-bar-fill" id="match-bar-fill" style="width:0%"></div>
        </div>
      </div>`;

  if (data.strengths?.length) {
    html += `<div class="gap-section">
      <div class="gap-section-title">💪 Your Strengths</div>
      ${data.strengths.map(s => `<div class="strength-item">✓ ${escHtml(s)}</div>`).join("")}
    </div>`;
  }

  if (data.strongMatches?.length) {
    html += `<div class="gap-section">
      <div class="gap-section-title">✅ Strong Matches</div>
      <div class="skill-chips">${data.strongMatches.map(s => `<span class="skill-chip matched">${escHtml(s)}</span>`).join("")}</div>
    </div>`;
  }

  if (data.partialMatches?.length) {
    html += `<div class="gap-section">
      <div class="gap-section-title">🟡 Partial Matches — Close But Needs Work</div>
      <div class="partial-list">
        ${data.partialMatches.map(p => `
          <div class="partial-item">
            <span class="skill-chip partial">${escHtml(p.skill)}</span>
            <span class="partial-note">${escHtml(p.note)}</span>
          </div>`).join("")}
      </div>
    </div>`;
  }

  if (data.gapSkills?.length) {
    html += `<div class="gap-section">
      <div class="gap-section-title">🔴 Skills to Acquire</div>
      ${data.gapSkills.map(g => `
        <div class="gap-card" data-priority="${(g.priority || "medium").toLowerCase()}">
          <div class="gap-card-header">
            <span class="gap-skill-name">${escHtml(g.skill)}</span>
            <span class="gap-priority priority-${(g.priority || "medium").toLowerCase()}">${escHtml(g.priority || "Medium")}</span>
          </div>
          <div class="gap-learn-time">⏱ Learn in: ${escHtml(g.learnIn || "varies")}</div>
          <div class="gap-resource">📚 ${escHtml(g.resource || "")}</div>
        </div>`).join("")}
    </div>`;
  }

  if (data.actionPlan?.length) {
    html += `<div class="gap-section">
      <div class="gap-section-title">📅 Your Personalised Action Plan</div>
      <div class="action-plan">
        ${data.actionPlan.map((step, i) => `
          <div class="action-step">
            <div class="action-step-num">${i + 1}</div>
            <div class="action-step-text">${escHtml(step)}</div>
          </div>`).join("")}
      </div>
    </div>`;
  }

  html += `</div>`;
  panel.innerHTML = html;

  // Animate match bar
  requestAnimationFrame(() => {
    setTimeout(() => {
      const bar = document.getElementById("match-bar-fill");
      if (bar) bar.style.width = (data.matchScore || 0) + "%";
    }, 100);
  });
}

/* ======================================================
   RESUME HTML BUILDER
   ====================================================== */
function buildResumeHTML(r) {
  const pi = r.personalInfo || {};
  const contactParts = [pi.email, pi.phone, pi.location, pi.linkedin, pi.portfolio].filter(Boolean);

  let html = `<div class="r-header">
    <div class="r-name">${escHtml(pi.fullName || "")}</div>
    <div class="r-contact">${contactParts.map(c => `<span>${escHtml(c)}</span>`).join("")}</div>
  </div>`;

  if (r.summary) {
    html += `<div class="r-section">
      <div class="r-section-title">Professional Summary</div>
      <p class="r-summary">${escHtml(r.summary)}</p>
    </div>`;
  }

  if (r.experience?.length) {
    html += `<div class="r-section"><div class="r-section-title">Experience</div>`;
    r.experience.forEach(exp => {
      const dateStr = exp.current
        ? `${exp.startDate} – Present`
        : `${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ""}`;
      html += `<div class="r-exp-item">
        <div class="r-exp-header">
          <span class="r-exp-title">${escHtml(exp.title || "")}</span>
          <span class="r-exp-date">${escHtml(dateStr)}</span>
        </div>
        <div class="r-exp-company">${escHtml(exp.company || "")}${exp.location ? ` · ${escHtml(exp.location)}` : ""}</div>
        <ul class="r-bullets">${(exp.bullets || []).map(b => `<li>${escHtml(b)}</li>`).join("")}</ul>
      </div>`;
    });
    html += `</div>`;
  }

  if (r.education?.length) {
    html += `<div class="r-section"><div class="r-section-title">Education</div>`;
    r.education.forEach(edu => {
      html += `<div class="r-edu-item">
        <div class="r-edu-degree">${escHtml(edu.degree || "")} in ${escHtml(edu.field || "")} · ${escHtml(edu.graduationYear || "")}</div>
        <div class="r-edu-school">${escHtml(edu.institution || "")}${edu.gpa ? ` · GPA: ${escHtml(edu.gpa)}` : ""}</div>
      </div>`;
    });
    html += `</div>`;
  }

  const skills = r.skills || {};
  if (Object.values(skills).some(v => v?.length)) {
    html += `<div class="r-section"><div class="r-section-title">Skills</div><div class="r-skills-grid">`;
    if (skills.technical?.length) html += `<span class="r-skill-label">Technical</span><span class="r-skill-val">${skills.technical.join(" · ")}</span>`;
    if (skills.tools?.length)     html += `<span class="r-skill-label">Tools</span><span class="r-skill-val">${skills.tools.join(" · ")}</span>`;
    if (skills.soft?.length)      html += `<span class="r-skill-label">Soft Skills</span><span class="r-skill-val">${skills.soft.join(" · ")}</span>`;
    if (skills.languages?.length) html += `<span class="r-skill-label">Languages</span><span class="r-skill-val">${skills.languages.join(" · ")}</span>`;
    html += `</div></div>`;
  }

  if (r.certifications?.length) {
    html += `<div class="r-section"><div class="r-section-title">Certifications</div><ul class="r-cert-list">
      ${r.certifications.map(c => `<li>• ${escHtml(typeof c === "string" ? c : c.name || JSON.stringify(c))}</li>`).join("")}
    </ul></div>`;
  }

  if (r.projects?.length) {
    html += `<div class="r-section"><div class="r-section-title">Projects</div>`;
    r.projects.forEach(proj => {
      html += `<div class="r-exp-item">
        <div class="r-exp-header">
          <span class="r-exp-title">${escHtml(proj.title || "")}</span>
          ${proj.link ? `<span class="r-exp-date"><a href="${proj.link}" target="_blank" style="color:inherit;text-decoration:none">${escHtml(proj.link.replace(/^https?:\/\//, ""))}</a></span>` : ""}
        </div>
        <p class="r-summary" style="margin-top:0.3rem">${escHtml(proj.description || "")}</p>
      </div>`;
    });
    html += `</div>`;
  }

  return html;
}

function escHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ======================================================
   RESULT BUTTONS
   ====================================================== */
function wireResultButtons() {
  // Kept for backward compat — use wireResultButtonsSafe() instead
  wireResultButtonsSafe();
}

async function downloadPDF() {
  const resumeDoc = document.getElementById("resume-document");
  if (!resumeDoc || !generatedResume) { 
    showToast("No resume content found to download.", "error"); 
    return; 
  }
  
  // High-fidelity client side PDF generation
  try {
    runClientSidePDF(resumeDoc);
  } catch (err) {
    console.error("PDF engine error:", err);
    showToast("Auto-download failed. Opening Print Menu instead...", "warning");
    window.print();
  }
}

// ─── Phase 2: High-Fidelity Isolation Engine (The "Clean-Room") ───
function runClientSidePDF(el) {
    showToast("Isolating resume for high-fidelity capture... 🛡️", "info");

    // 1. Create a hidden, isolated capture container to prevent UI interference
    const captureContainer = document.createElement("div");
    captureContainer.id = "pdf-capture-isolate";
    Object.assign(captureContainer.style, {
        position: "absolute",
        left: "-9999px",
        top: "0",
        width: "800px", // Standardize width for A4
        background: "white",
        zIndex: "-1000"
    });

    // 2. Clone the resume and strip all dynamic UI interference
    const clone = el.cloneNode(true);
    clone.style.margin = "0";
    clone.style.boxShadow = "none";
    clone.style.transform = "none";
    clone.querySelectorAll("[contenteditable]").forEach(n => n.removeAttribute("contenteditable"));

    // 3. Inject into DOM temporarily for rendering
    captureContainer.appendChild(clone);
    document.body.appendChild(captureContainer);

    // 4. Extract current styles to ensure theme parity
    const styles = Array.from(document.styleSheets)
        .filter(s => !s.href || s.href.includes(window.location.hostname))
        .map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join(""); } catch(e){return "";} })
        .join("");
    
    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    captureContainer.appendChild(styleEl);

    // 5. Wait for layout to settle in the "Clean Room"
    setTimeout(() => {
        const name = generatedResume.personalInfo?.fullName?.replace(/\s+/g, "_") || "Resume";
        const opt = {
            margin: [10, 10], 
            filename: `${name}_Resume.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { 
                scale: 2.5, // Increased clarity
                useCORS: true, 
                backgroundColor: "#ffffff",
                removeContainer: true,
                logging: false
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
        };

        html2pdf().set(opt).from(clone).save().then(() => {
            document.body.removeChild(captureContainer);
            showToast("PDF Downloaded Successfully! ✅", "success");
        }).catch(err => {
            console.error(err);
            document.body.removeChild(captureContainer);
            showToast("Fallback: Please use Ctrl+P to save as PDF", "error");
        });
    }, 500); // 500ms safety settle time
}

function downloadBlob(blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = generatedResume.personalInfo?.fullName?.replace(/\s+/g, "_") || "Resume";
    a.download = `${name}_Resume.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

async function openCoverLetter() {
  if (!generatedResume) { showToast("Generate a resume first.", "error"); return; }
  const modal = document.getElementById("cover-letter-modal");
  modal.classList.remove("hidden");
  document.getElementById("cover-letter-loading").style.display = "flex";
  document.getElementById("cover-letter-text").classList.add("hidden");

  const jobDesc = document.getElementById("job-description").value.trim();
  const company = document.getElementById("company-name").value.trim() || "the company";

  try {
    const text = await generateCoverLetter(generatedResume, jobDesc, company);
    document.getElementById("cover-letter-text").textContent = text;
    document.getElementById("cover-letter-text").classList.remove("hidden");
    document.getElementById("cover-letter-loading").style.display = "none";
  } catch (err) {
    showToast("Cover letter failed: " + err.message, "error");
    modal.classList.add("hidden");
  }
}

function copyCoverLetter() {
  const text = document.getElementById("cover-letter-text").textContent;
  navigator.clipboard.writeText(text).then(() => showToast("Copied to clipboard!", "success"));
}

/* ======================================================
   TOAST
   ====================================================== */
export function showToast(msg, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(20px) scale(0.95)";
    toast.style.transition = "all 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ======================================================
   SCROLL / NAV
   ====================================================== */
function wireSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      }
    });
  });
}

function wireNavbarScroll() {
  const navbar = document.getElementById("navbar");
  const btt    = document.getElementById("back-to-top");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 60);
    btt?.classList.toggle("visible", window.scrollY > 400);
  });
  btt?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function wireHeroButtons() {
  const scrollToBuilder = () =>
    document.getElementById("builder").scrollIntoView({ behavior: "smooth" });
  document.getElementById("hero-start-btn")?.addEventListener("click", scrollToBuilder);
  document.getElementById("nav-start-btn")?.addEventListener("click", scrollToBuilder);
}

/* ======================================================
   STRATEGY SYNC
   ====================================================== */
function initStrategySync() {
  const jdInitial    = document.getElementById("job-description-initial");
  const jdFinal      = document.getElementById("job-description");
  const jdFocusArea  = document.getElementById("jd-initial-focus");
  const radioEnhance = document.getElementById("mode-enhance");
  const radioStrict  = document.getElementById("mode-strict");

  if (!jdInitial || !jdFinal) return;

  // Sync initial -> final
  jdInitial.addEventListener("input", () => {
    jdFinal.value = jdInitial.value;
  });

  // Sync final -> initial
  jdFinal.addEventListener("input", () => {
    jdInitial.value = jdFinal.value;
  });

  // Handle visibility
  const updateVisibility = () => {
    if (radioStrict && radioStrict.checked) {
      jdFocusArea.style.display = "none";
    } else {
      jdFocusArea.style.display = "block";
    }
  };

  radioEnhance?.addEventListener("change", updateVisibility);
  radioStrict?.addEventListener("change", updateVisibility);
  
  // Initial run
  updateVisibility();
}

/* ======================================================
   EXPOSE to global for inline onclick
   ====================================================== */
window.removeEntry = removeEntry;

/* ======================================================
   QUICK FILL HELPERS
   ====================================================== */
function quickFillPersonal() {
  document.getElementById("full-name").value = "Jonathan Doe";
  document.getElementById("email").value = "j.doe@example.com";
  document.getElementById("phone").value = "+1 (555) 123-4567";
  document.getElementById("location").value = "San Francisco, CA";
  document.getElementById("linkedin").value = "linkedin.com/in/jdoe";
  document.getElementById("portfolio").value = "jonathandoe.dev";
  document.getElementById("years-exp").value = "8";
  showToast("Personal details filled! ✨", "success");
}

function quickFillExperience() {
  addExperienceEntry();
  const lastEntry = document.querySelector("#experience-entries .entry-card:last-child");
  if (lastEntry) {
    lastEntry.querySelector('[data-field="title"]').value = "Senior Software Architect";
    lastEntry.querySelector('[data-field="company"]').value = "TechFlow Solutions";
    lastEntry.querySelector('[data-field="location"]').value = "San Francisco, CA";
    lastEntry.querySelector('[data-field="startDate"]').value = "Jan 2020";
    lastEntry.querySelector('[data-field="endDate"]').value = "Present";
    lastEntry.querySelector('[data-field="current"]').checked = true;
    lastEntry.querySelector('[data-field="description"]').value = "Architected a distributed microservices platform using Node.js and AWS. Led a team of 12 developers. Reduced infrastructure costs by 20%.";
    showToast("Example position added! 💼", "success");
  }
}

function quickFillEducation() {
  addEducationEntry();
  const lastEntry = document.querySelector("#education-entries .entry-card:last-child");
  if (lastEntry) {
    lastEntry.querySelector('[data-field="degree"]').value = "Master of Science";
    lastEntry.querySelector('[data-field="field"]').value = "Computer Science";
    lastEntry.querySelector('[data-field="institution"]').value = "Stanford University";
    lastEntry.querySelector('[data-field="graduationYear"]').value = "2018";
    lastEntry.querySelector('[data-field="gpa"]').value = "3.9";
    showToast("Example education added! 🎓", "success");
  }
}

window.quickFillPersonal = quickFillPersonal;
window.quickFillExperience = quickFillExperience;
window.quickFillEducation = quickFillEducation;

/* ======================================================
   RESUME TEMPLATES
   ====================================================== */
let activeTemplate = "modern";

function initTemplateSwitcher() {
  const templateBtn   = document.getElementById("template-btn");
  const templateModal = document.getElementById("template-modal");
  const closeModal    = document.getElementById("close-template-modal");

  if (!templateBtn || !templateModal) return;

  templateBtn.addEventListener("click", () => {
    templateModal.classList.remove("hidden");
  });

  closeModal?.addEventListener("click", () => {
    templateModal.classList.add("hidden");
  });

  // Click outside to close
  templateModal.addEventListener("click", (e) => {
    if (e.target === templateModal) templateModal.classList.add("hidden");
  });

  // Template option selection
  document.querySelectorAll(".template-option").forEach(opt => {
    opt.addEventListener("click", () => {
      document.querySelectorAll(".template-option").forEach(o => o.classList.remove("active"));
      opt.classList.add("active");
      const tpl = opt.dataset.template;
      applyTemplate(tpl);
      activeTemplate = tpl;
      templateModal.classList.add("hidden");
      showToast(`Template switched to "${opt.querySelector(".template-name").textContent}" ✨`, "success");
    });
  });
}

function applyTemplate(template) {
  const doc = document.getElementById("resume-document");
  if (!doc) return;
  doc.className = `resume-theme-${template}`;
}

/* ======================================================
   INLINE EDITING
   ====================================================== */
function enableInlineEditing() {
  const doc = document.getElementById("resume-document");
  if (!doc) return;

  // Make all text elements editable
  const editables = doc.querySelectorAll(
    ".r-name, .r-summary, .r-exp-title, .r-exp-company, .r-exp-date, li, .r-edu-degree, .r-edu-school, .r-skill-val, .r-cert-list li, .r-proj-title, .r-proj-link"
  );
  editables.forEach(el => {
    el.setAttribute("contenteditable", "true");
    el.setAttribute("spellcheck", "true");
    el.title = "Click to edit";
  });

  // Show edit hint toast
  showToast("💡 Click any text in your resume to edit it directly!", "info");
}

/* ======================================================
   PATCH: wireResultButtons — safe version
   ====================================================== */
function wireResultButtonsSafe() {
  document.getElementById("download-pdf-btn")?.addEventListener("click", downloadPDF);
  document.getElementById("regenerate-btn")?.addEventListener("click", handleGenerate);
  document.getElementById("cover-letter-btn")?.addEventListener("click", openCoverLetter);
  document.getElementById("generate-btn")?.addEventListener("click", handleGenerate);
  document.getElementById("close-cover-letter")?.addEventListener("click", () => {
    document.getElementById("cover-letter-modal")?.classList.add("hidden");
  });
  document.getElementById("copy-cover-letter")?.addEventListener("click", copyCoverLetter);
  document.getElementById("template-btn")?.addEventListener("click", () => {
    document.getElementById("template-modal")?.classList.remove("hidden");
  });
}
/* ======================================================
   THEME TOGGLE (Day / Night Mode)
   ====================================================== */
function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const html = document.documentElement;
  
  // Restore saved preference
  const saved = localStorage.getItem("resumeai-theme");
  if (saved === "light") {
    html.classList.add("light-mode");
  }

  if (!btn) return;

  btn.addEventListener("click", () => {
    const isLight = html.classList.contains("light-mode");

    // Ripple animation outward from button
    createThemeRipple(btn, isLight);

    // Small delay so ripple starts before swap
    setTimeout(() => {
      document.body.classList.add("theme-switching");
      html.classList.toggle("light-mode");
      localStorage.setItem(
        "resumeai-theme",
        html.classList.contains("light-mode") ? "light" : "dark"
      );
      setTimeout(() => document.body.classList.remove("theme-switching"), 400);
    }, 60);

    // Toast
    const mode = isLight ? "Dark" : "Light";
    showToast(`${mode} mode activated ${isLight ? "🌙" : "☀️"}`, "info");
  });
}

function createThemeRipple(btn, currentlyLight) {
  const ripple = document.createElement("div");
  const rect = btn.getBoundingClientRect();
  const size = Math.max(window.innerWidth, window.innerHeight) * 2.5;
  
  Object.assign(ripple.style, {
    position: "fixed",
    borderRadius: "50%",
    width: size + "px",
    height: size + "px",
    left: (rect.left + rect.width / 2 - size / 2) + "px",
    top: (rect.top + rect.height / 2 - size / 2) + "px",
    background: currentlyLight ? "rgba(5,7,14,0.15)" : "rgba(240,244,255,0.15)",
    transform: "scale(0)",
    transition: "transform 0.6s ease, opacity 0.6s ease",
    opacity: "1",
    pointerEvents: "none",
    zIndex: "9999",
  });
  
  document.body.appendChild(ripple);
  requestAnimationFrame(() => {
    ripple.style.transform = "scale(1)";
    ripple.style.opacity = "0";
  });
  setTimeout(() => ripple.remove(), 700);
}
