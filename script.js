/* ===== HireHub – Online Job Portal (Vanilla JS + localStorage) ===== */
'use strict';

/* ---------- 1. Config & seed data ---------- */
const KEYS = { jobs: 'jp_jobs_v1', saved: 'jp_saved', apps: 'jp_apps', profile: 'jp_profile' };
const CATEGORIES = ['Software Development', 'Data & Analytics', 'Design', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'Customer Support'];
const TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract'];
const MODES = ['On-site', 'Hybrid', 'Remote'];
const CITIES = ['Kolkata', 'Bengaluru', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Chennai'];
const EXP = [
  { id: 'any', label: 'Any experience', min: 0, max: 99 }, { id: '0', label: 'Fresher', min: 0, max: 0 },
  { id: '1-3', label: '1–3 years', min: 1, max: 3 }, { id: '3-5', label: '3–5 years', min: 3, max: 5 }, { id: '5+', label: '5+ years', min: 5, max: 99 }
];
const POSTED = [{ id: '0', label: 'Any time' }, { id: '1', label: 'Last 24 hours' }, { id: '7', label: 'Last 7 days' }, { id: '30', label: 'Last 30 days' }];
const STATUSES = ['Applied', 'Under review', 'Shortlisted', 'Interview scheduled'];
const STEP_MS = 15000; // demo speed: each application status lasts 15 seconds
const PAGE_SIZE = 8;

// Typical duties per category, used on the job details page
const DUTIES = [
  ['Design, build and review features end to end', 'Write clean, tested and well-documented code', 'Work with product and design to ship on schedule'],
  ['Collect, clean and analyse data from multiple sources', 'Build dashboards and models that guide decisions', 'Present insights clearly to non-technical teams'],
  ['Turn ideas into wireframes, prototypes and polished visuals', 'Run feedback sessions and iterate quickly', 'Keep the brand and design system consistent'],
  ['Plan and run campaigns across digital channels', 'Track performance and optimise spend', 'Create clear, engaging content for the target audience'],
  ['Find, qualify and nurture new business opportunities', 'Prepare proposals and close deals', 'Maintain accurate pipeline records'],
  ['Prepare reports, reconciliations and forecasts', 'Ensure compliance with accounting standards', 'Support audits and month-end closing'],
  ['Support hiring, onboarding and employee engagement', 'Maintain people records and policies', 'Partner with managers on team needs'],
  ['Resolve customer queries quickly and politely', 'Document issues and escalate when needed', 'Share feedback to improve the product']
];

// [title, company, city, typeIdx, modeIdx, categoryIdx, expMin, expMax, salMin(LPA), salMax(LPA), skills, daysAgo, summary]
const RAW_JOBS = [
  ['Frontend Developer', 'Nimbus Labs', 'Bengaluru', 0, 1, 0, 2, 4, 8, 14, 'React,TypeScript,CSS', 1, 'Build fast, accessible interfaces for a B2B analytics product.'],
  ['Backend Engineer (Node.js)', 'Kestrel Systems', 'Hyderabad', 0, 0, 0, 3, 6, 14, 24, 'Node.js,PostgreSQL,AWS', 2, 'Own APIs and services that power a payments platform.'],
  ['Full Stack Developer', 'Bongo Tech', 'Kolkata', 0, 1, 0, 1, 3, 5, 9, 'JavaScript,Node.js,MongoDB', 3, 'Join a small product team shipping features every week.'],
  ['Web Development Intern', 'Pixelwave Studio', 'Kolkata', 2, 2, 0, 0, 0, 1.8, 2.4, 'HTML,CSS,JavaScript', 1, 'Learn on real client projects with a mentor.'],
  ['Android Developer', 'Zenith Apps', 'Pune', 0, 0, 0, 2, 5, 9, 16, 'Kotlin,Jetpack,REST', 5, 'Build and maintain a consumer app used by millions.'],
  ['DevOps Engineer', 'Cloudcrest', 'Bengaluru', 0, 2, 0, 4, 8, 18, 30, 'Kubernetes,Terraform,CI/CD', 4, 'Automate infrastructure and keep deployments reliable.'],
  ['QA Automation Engineer', 'Nimbus Labs', 'Pune', 3, 2, 0, 3, 6, 12, 20, 'Selenium,Cypress,API testing', 6, '6-month contract to strengthen automated test coverage.'],
  ['Data Analyst', 'Greenfield Analytics', 'Kolkata', 0, 1, 1, 1, 3, 5, 8, 'SQL,Excel,Power BI', 2, 'Turn business questions into clear dashboards and reports.'],
  ['Machine Learning Engineer', 'Aperture AI', 'Bengaluru', 0, 1, 1, 3, 6, 20, 35, 'Python,PyTorch,MLOps', 6, 'Train, evaluate and deploy models in production.'],
  ['Data Science Intern', 'Aperture AI', 'Pune', 2, 2, 1, 0, 0, 2.4, 3.6, 'Python,Pandas,Statistics', 3, 'Work with senior scientists on real datasets.'],
  ['UI/UX Designer', 'Lumen Design Co.', 'Mumbai', 0, 1, 2, 2, 5, 8, 15, 'Figma,Prototyping,User research', 1, 'Design clean, usable experiences for web and mobile.'],
  ['Graphic Designer', 'Pixelwave Studio', 'Kolkata', 0, 0, 2, 1, 3, 4, 7, 'Photoshop,Illustrator,Branding', 7, 'Create campaign visuals and brand assets for clients.'],
  ['Product Designer', 'Nimbus Labs', 'Bengaluru', 0, 2, 2, 4, 7, 18, 28, 'Figma,Design systems,Research', 8, 'Lead design for a core product area, from idea to launch.'],
  ['Digital Marketing Executive', 'Brightpath Media', 'Delhi NCR', 0, 0, 3, 1, 3, 4, 7, 'SEO,Google Ads,Analytics', 2, 'Plan and optimise paid and organic campaigns.'],
  ['Content Writer', 'Brightpath Media', 'Kolkata', 1, 2, 3, 0, 2, 2.4, 4.8, 'Copywriting,SEO,Research', 4, 'Write blogs, emails and social copy for tech brands.'],
  ['Growth Marketing Manager', 'Kestrel Systems', 'Mumbai', 0, 1, 3, 5, 9, 18, 28, 'Funnels,A/B testing,CRM', 10, 'Own acquisition and retention experiments across channels.'],
  ['Business Development Executive', 'Ridgeway Finserv', 'Delhi NCR', 0, 0, 4, 1, 3, 4, 8, 'Lead generation,Negotiation,CRM', 3, 'Open new accounts and grow the client base.'],
  ['Inside Sales Representative', 'Zenith Apps', 'Hyderabad', 0, 1, 4, 0, 2, 3.5, 6, 'Cold calling,Communication,CRM', 5, 'Qualify inbound leads and book demos for the team.'],
  ['Account Manager', 'Cloudcrest', 'Chennai', 0, 1, 4, 4, 7, 10, 18, 'Client success,Upselling,Reporting', 12, 'Manage enterprise relationships and renewals.'],
  ['Financial Analyst', 'Ridgeway Finserv', 'Mumbai', 0, 0, 5, 2, 4, 8, 14, 'Excel,Financial modelling,Reporting', 6, 'Build forecasts and support investment decisions.'],
  ['Accounts Executive', 'Bongo Tech', 'Kolkata', 0, 0, 5, 1, 3, 3.5, 5.5, 'Tally,GST,Excel', 9, 'Handle day-to-day accounting, invoicing and GST filings.'],
  ['Talent Acquisition Executive', 'Lumen Design Co.', 'Chennai', 0, 1, 6, 1, 3, 4, 7, 'Sourcing,Interviewing,ATS', 2, 'Run end-to-end hiring for design and tech roles.'],
  ['HR Business Partner', 'Kestrel Systems', 'Bengaluru', 0, 1, 6, 5, 9, 16, 26, 'Employee relations,Policy,Analytics', 15, 'Partner with leaders on people strategy and culture.'],
  ['Customer Support Associate', 'Zenith Apps', 'Kolkata', 0, 0, 7, 0, 2, 2.8, 4.2, 'Communication,Ticketing,Empathy', 1, 'Help customers over chat and email with a friendly approach.'],
  ['Technical Support Engineer', 'Cloudcrest', 'Hyderabad', 0, 2, 7, 1, 3, 5, 9, 'Troubleshooting,Linux,APIs', 4, 'Diagnose technical issues for developers using our platform.']
];
const hueOf = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const SEED_JOBS = RAW_JOBS.map(([title, company, city, t, m, c, expMin, expMax, salMin, salMax, skills, days, summary], i) => ({
  id: i + 1, title, company, city, type: TYPES[t], mode: MODES[m], category: CATEGORIES[c], expMin, expMax, salMin, salMax,
  skills: skills.split(','), summary, postedAt: Date.now() - days * 864e5 - i * 6e5, mine: false
}));

/* ---------- 2. Storage, state & helpers ---------- */
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked: keep working in memory */ } };
const defaultFilters = () => ({ q: '', loc: '', cats: [], types: [], modes: [], exp: 'any', minSal: 0, posted: '0' });

const state = {
  jobs: load(KEYS.jobs, SEED_JOBS), saved: load(KEYS.saved, []), apps: load(KEYS.apps, []), profile: load(KEYS.profile, {}),
  f: defaultFilters(), sort: 'new', shown: PAGE_SIZE, tab: 'jobs'
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const jobById = (id) => state.jobs.find((j) => j.id === id);
const initials = (name) => name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const lpa = (n) => (Number.isInteger(n) ? n : n.toFixed(1));
const isInternship = (j) => j.type === 'Internship';
const salText = (j) => (isInternship(j)
  ? `₹${Math.round((j.salMin * 100) / 12)}k–${Math.round((j.salMax * 100) / 12)}k / month`
  : `₹${lpa(j.salMin)}–${lpa(j.salMax)} LPA`);
const expText = (j) => (j.expMax === 0 ? 'Fresher' : `${j.expMin}–${j.expMax} yrs`);
const daysSince = (ts) => Math.floor((Date.now() - ts) / 864e5);
const ago = (ts) => { const d = daysSince(ts); return d === 0 ? 'Today' : d === 1 ? '1 day ago' : d < 30 ? `${d} days ago` : `${Math.floor(d / 30)} mo ago`; };

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

/* ---------- 3. Search & filtering ---------- */
function filteredJobs() {
  const f = state.f;
  const words = f.q.split(/\s+/).filter(Boolean);
  const exp = EXP.find((e) => e.id === f.exp);
  const list = state.jobs.filter((j) => {
    const hay = `${j.title} ${j.company} ${j.category} ${j.type} ${j.skills.join(' ')}`.toLowerCase();
    return words.every((w) => hay.includes(w)) &&
      (!f.loc || j.city === f.loc) &&
      (!f.cats.length || f.cats.includes(j.category)) &&
      (!f.types.length || f.types.includes(j.type)) &&
      (!f.modes.length || f.modes.includes(j.mode)) &&
      j.expMin <= exp.max && j.expMax >= exp.min &&
      j.salMax >= f.minSal &&
      (f.posted === '0' || daysSince(j.postedAt) <= Number(f.posted));
  });
  return list.sort((a, b) => (state.sort === 'salary' ? b.salMax - a.salMax : b.postedAt - a.postedAt));
}

/* ---------- 4. Rendering ---------- */
function jobCard(j) {
  const saved = state.saved.includes(j.id);
  return `<article class="job">
    <div class="logo" style="--h:${hueOf(j.company)}" aria-hidden="true">${esc(initials(j.company))}</div>
    <div class="info">
      <h3><button class="title" data-detail="${j.id}">${esc(j.title)}</button></h3>
      <p class="co">${esc(j.company)} · ${esc(j.city)}</p>
      <div class="meta"><span class="tag type">${j.type}</span><span class="tag">${j.mode}</span><span class="tag">${expText(j)}</span><span class="sal">${salText(j)}</span></div>
      <div class="skills">${j.skills.map((s) => `<span class="skill">${esc(s)}</span>`).join('')}</div>
    </div>
    <div class="side">
      <button class="save" data-save="${j.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save job'}">${saved ? '★' : '☆'}</button>
      <small>${ago(j.postedAt)}</small>
      <button class="btn primary sm" data-detail="${j.id}">View details</button>
    </div>
  </article>`;
}

function renderFilters() {
  const group = (key, title, opts) => `<fieldset><legend>${title}</legend>${opts.map((o) =>
    `<label class="chk"><input type="checkbox" data-g="${key}" value="${esc(o)}" ${state.f[key].includes(o) ? 'checked' : ''}>${esc(o)}</label>`).join('')}</fieldset>`;
  const radio = (key, title, opts) => `<fieldset><legend>${title}</legend>${opts.map((o) =>
    `<label class="chk"><input type="radio" name="${key}" data-r="${key}" value="${o.id}" ${state.f[key] === o.id ? 'checked' : ''}>${o.label}</label>`).join('')}</fieldset>`;
  $('#filters').innerHTML = `<div class="fhead"><h3>Filters</h3><button class="link" data-clear>Clear all</button></div>` +
    group('cats', 'Category', CATEGORIES) + group('types', 'Job type', TYPES) + group('modes', 'Work mode', MODES) +
    radio('exp', 'Experience', EXP) +
    `<fieldset><legend>Minimum salary: <b id="salVal">₹${state.f.minSal} LPA</b></legend><input type="range" id="salRange" min="0" max="30" step="1" value="${state.f.minSal}"></fieldset>` +
    radio('posted', 'Date posted', POSTED);
}

function renderJobs() {
  const list = filteredJobs();
  $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'job' : 'jobs'} found`;
  $('#jobList').innerHTML = list.length
    ? list.slice(0, state.shown).map(jobCard).join('')
    : '<div class="empty"><strong>No jobs match your search.</strong><br>Try different keywords or clear some filters.</div>';
  $('#loadMore').hidden = list.length <= state.shown;
}

function renderSaved() {
  const jobs = state.jobs.filter((j) => state.saved.includes(j.id));
  $('#savedList').innerHTML = jobs.length ? jobs.map(jobCard).join('')
    : '<div class="empty">No saved jobs yet. Tap the ☆ on any job to keep it here.</div>';
}

function renderApps() {
  $('#appList').innerHTML = state.apps.length ? state.apps.map((a) => {
    const step = STATUSES.indexOf(a.status);
    return `<li class="app">
      <div class="row"><div><strong>${esc(a.jobTitle)}</strong><div class="muted">${esc(a.company)}</div></div>
        <small class="muted">Applied ${new Date(a.appliedAt).toLocaleDateString()}</small></div>
      <ol class="track">${STATUSES.map((s, k) => `<li class="${k <= step ? 'done' : ''}">${s}</li>`).join('')}</ol>
      <div class="row"><small class="muted">Resume: ${esc(a.resume)}</small>
        ${jobById(a.jobId) ? `<button class="link" data-detail="${a.jobId}">View job</button>` : ''}</div>
    </li>`;
  }).join('') : '<li class="empty">You have not applied to any jobs yet.</li>';
}

function renderStats() {
  const companies = new Set(state.jobs.map((j) => j.company)).size;
  $('#stats').innerHTML = `<div><dt>Open jobs</dt><dd>${state.jobs.length}</dd></div><div><dt>Hiring companies</dt><dd>${companies}</dd></div><div><dt>Your applications</dt><dd>${state.apps.length}</dd></div>`;
}

function renderCounts() {
  $('#savedCount').textContent = state.saved.length;
  $('#appCount').textContent = state.apps.length;
  renderStats();
}

function setTab(tab) {
  state.tab = tab;
  ['jobs', 'saved', 'applied'].forEach((t) => { $('#view-' + t).hidden = t !== tab; });
  $$('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  if (tab === 'saved') renderSaved();
  if (tab === 'applied') renderApps();
  window.scrollTo({ top: 0 });
}

function fillSelects() {
  const opts = (arr) => arr.map((o) => `<option>${esc(o)}</option>`).join('');
  $('#loc').innerHTML = '<option value="">All locations</option>' + opts(CITIES);
  $('#postCity').innerHTML = opts(CITIES);
  $('#postType').innerHTML = opts(TYPES);
  $('#postMode').innerHTML = opts(MODES);
  $('#postCat').innerHTML = opts(CATEGORIES);
}

/* ---------- 5. Panels (modals) ---------- */
function closePanels() {
  $$('.modal.open').forEach((m) => m.classList.remove('open'));
  $('#overlay').hidden = true;
}
function openPanel(id) {
  closePanels();
  $('#' + id).classList.add('open');
  $('#overlay').hidden = false;
}

function openDetail(id) {
  const j = jobById(id);
  if (!j) return;
  const applied = state.apps.some((a) => a.jobId === id);
  const saved = state.saved.includes(id);
  $('#detailBody').innerHTML = `
    <div class="dhead">
      <div class="logo lg" style="--h:${hueOf(j.company)}" aria-hidden="true">${esc(initials(j.company))}</div>
      <div><h2 id="detailTitle">${esc(j.title)}</h2><div class="muted">${esc(j.company)} · ${esc(j.city)} · Posted ${ago(j.postedAt).toLowerCase()}</div></div>
    </div>
    <div class="dgrid">
      <div><b>${isInternship(j) ? 'Stipend' : 'Salary'}</b>${salText(j)}</div><div><b>Job type</b>${j.type}</div>
      <div><b>Work mode</b>${j.mode}</div><div><b>Experience</b>${expText(j)}</div><div><b>Category</b>${esc(j.category)}</div>
    </div>
    <div class="dbody">
      <h4>About the role</h4><p>${esc(j.summary)}</p>
      <h4>What you will do</h4><ul>${DUTIES[CATEGORIES.indexOf(j.category)]?.map((d) => `<li>${d}</li>`).join('') || '<li>Contribute to team goals</li>'}</ul>
      <h4>What we are looking for</h4>
      <ul><li>${j.expMax === 0 ? 'Freshers and final-year students are welcome' : `${expText(j)} of relevant experience`}</li>
      <li>Good written and spoken communication</li><li>Hands-on skills in: ${j.skills.map(esc).join(', ')}</li></ul>
      <div class="skills">${j.skills.map((s) => `<span class="skill">${esc(s)}</span>`).join('')}</div>
    </div>
    <div class="dactions">
      <button class="btn primary" data-apply="${id}" ${applied ? 'disabled' : ''}>${applied ? 'Applied ✓' : 'Apply now'}</button>
      <button class="btn ghost" data-save="${id}" aria-pressed="${saved}">${saved ? '★ Saved' : '☆ Save job'}</button>
      ${j.mine ? `<button class="link danger" data-removejob="${id}">Remove posting</button>` : ''}
    </div>`;
  openPanel('detailModal');
}

function openApply(id) {
  const j = jobById(id);
  if (!j) return;
  const f = $('#applyForm');
  f.reset();
  $$('#applyForm [data-err]').forEach((el) => { el.textContent = ''; });
  f.elements.jobId.value = id;
  f.elements.name.value = state.profile.name || '';
  f.elements.email.value = state.profile.email || '';
  f.elements.phone.value = state.profile.phone || '';
  $('#applyTitle').textContent = 'Apply for ' + j.title;
  $('#applyFor').textContent = `${j.company} · ${j.city}`;
  openPanel('applyModal');
}

/* ---------- 6. Actions ---------- */
function toggleSave(id) {
  const had = state.saved.includes(id);
  state.saved = had ? state.saved.filter((x) => x !== id) : [...state.saved, id];
  save(KEYS.saved, state.saved);
  toast(had ? 'Removed from saved jobs' : 'Job saved');
  renderCounts();
  if (state.tab === 'saved') renderSaved(); else renderJobs();
  if ($('#detailModal').classList.contains('open')) openDetail(id);
}

function resetResults() { state.shown = PAGE_SIZE; renderJobs(); }

function tickStatuses() {
  let changed = false;
  state.apps.forEach((a) => {
    const idx = Math.min(STATUSES.length - 1, Math.floor((Date.now() - a.appliedAt) / STEP_MS));
    if (STATUSES[idx] !== a.status) { a.status = STATUSES[idx]; changed = true; }
  });
  if (changed) { save(KEYS.apps, state.apps); if (state.tab === 'applied') renderApps(); }
}

/* ---------- 7. Events (delegation) ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-tab],[data-detail],[data-save],[data-apply],[data-open],[data-close],[data-more],[data-clear],[data-tag],[data-removejob]');
  if (!el) return;
  const d = el.dataset;
  if (el.tagName === 'A') e.preventDefault();
  if (d.tab) setTab(d.tab);
  else if (d.detail) openDetail(+d.detail);
  else if (d.save) toggleSave(+d.save);
  else if (d.apply) openApply(+d.apply);
  else if (d.open) openPanel(d.open);
  else if ('close' in d) closePanels();
  else if ('more' in d) { state.shown += PAGE_SIZE; renderJobs(); }
  else if ('clear' in d) { state.f = defaultFilters(); $('#q').value = ''; $('#loc').value = ''; renderFilters(); resetResults(); }
  else if (d.tag) { $('#q').value = d.tag; state.f.q = d.tag.toLowerCase(); resetResults(); $('#view-jobs .layout').scrollIntoView({ behavior: 'smooth' }); }
  else if (d.removejob) {
    const id = +d.removejob;
    state.jobs = state.jobs.filter((j) => j.id !== id);
    state.saved = state.saved.filter((x) => x !== id);
    save(KEYS.jobs, state.jobs); save(KEYS.saved, state.saved);
    closePanels(); renderCounts(); renderJobs(); toast('Job removed');
  }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels(); });

$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  state.f.q = $('#q').value.trim().toLowerCase();
  state.f.loc = $('#loc').value;
  resetResults();
  $('#view-jobs .layout').scrollIntoView({ behavior: 'smooth' });
});
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; resetResults(); });
$('#filterBtn').addEventListener('click', () => $('#filters').classList.toggle('show'));

$('#filters').addEventListener('change', (e) => {
  const el = e.target;
  if (el.dataset.g) {
    const arr = state.f[el.dataset.g];
    state.f[el.dataset.g] = el.checked ? [...arr, el.value] : arr.filter((v) => v !== el.value);
  } else if (el.dataset.r) state.f[el.dataset.r] = el.value;
  resetResults();
});
$('#filters').addEventListener('input', (e) => {
  if (e.target.id !== 'salRange') return;
  state.f.minSal = Number(e.target.value);
  $('#salVal').textContent = `₹${state.f.minSal} LPA`;
  resetResults();
});

/* Apply form */
$('#applyForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const g = (n) => form.elements[n].value.trim();
  const file = form.elements.resume.files[0];
  $$('#applyForm [data-err]').forEach((el) => { el.textContent = ''; });
  let valid = true;
  const check = (field, ok, msg) => { if (!ok) { $(`#applyForm [data-err="${field}"]`).textContent = msg; valid = false; } };
  check('name', /^\p{L}[\p{L}\p{M} .'-]{1,49}$/u.test(g('name')), 'Enter your full name (letters only).');
  check('email', /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(g('email')), 'Enter a valid email address.');
  check('phone', /^[6-9]\d{9}$/.test(g('phone')), 'Enter a 10-digit mobile number starting with 6–9.');
  check('resume', !!file, 'Please attach your resume.');
  if (file) {
    check('resume', /\.(pdf|docx?)$/i.test(file.name), 'Resume must be a PDF or Word file.');
    check('resume', file.size <= 2 * 1024 * 1024, 'Resume must be 2 MB or smaller.');
  }
  if (!valid) return;

  const job = jobById(Number(g('jobId')));
  if (!job || state.apps.some((a) => a.jobId === job.id)) return;
  state.profile = { name: g('name'), email: g('email'), phone: g('phone') };
  save(KEYS.profile, state.profile);
  state.apps.unshift({
    id: 'APP-' + Date.now().toString(36).toUpperCase(), jobId: job.id, jobTitle: job.title, company: job.company,
    applicant: state.profile, resume: file.name, note: g('note'), appliedAt: Date.now(), status: STATUSES[0]
  });
  save(KEYS.apps, state.apps);
  renderCounts();
  closePanels();
  toast(`Application sent to ${job.company}`);
  setTab('applied');
});

/* Post-a-job form */
$('#postForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const g = (n) => form.elements[n].value.trim();
  const num = (n) => Number(form.elements[n].value);
  $$('#postForm [data-err]').forEach((el) => { el.textContent = ''; });
  let valid = true;
  const check = (field, ok, msg) => { if (!ok) { $(`#postForm [data-err="${field}"]`).textContent = msg; valid = false; } };
  const skills = g('skills').split(',').map((s) => s.trim()).filter(Boolean);
  check('title', g('title').length >= 3, 'Enter a job title (at least 3 characters).');
  check('company', g('company').length >= 2, 'Enter the company name.');
  check('range', num('expMax') >= num('expMin') && num('salMax') >= num('salMin') && num('salMax') > 0,
    'Maximum experience and salary must be at least the minimum.');
  check('skills', skills.length >= 1, 'Add at least one skill.');
  check('summary', g('summary').length >= 20, 'Describe the role in at least 20 characters.');
  if (!valid) return;

  state.jobs.unshift({
    id: state.jobs.reduce((max, j) => Math.max(max, j.id), 0) + 1, title: g('title'), company: g('company'),
    city: g('city'), type: g('type'), mode: g('mode'), category: g('category'),
    expMin: num('expMin'), expMax: num('expMax'), salMin: num('salMin'), salMax: num('salMax'),
    skills: skills.slice(0, 6), summary: g('summary'), postedAt: Date.now(), mine: true
  });
  save(KEYS.jobs, state.jobs);
  form.reset();
  closePanels();
  setTab('jobs');
  state.f = defaultFilters(); $('#q').value = ''; $('#loc').value = '';
  renderFilters(); resetResults(); renderCounts();
  toast('Job published');
});

$('#applyForm').elements.phone.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });

/* ---------- 8. Init ---------- */
save(KEYS.jobs, state.jobs); // seed the sample jobs on first run
fillSelects();
renderFilters();
renderJobs();
renderCounts();
tickStatuses();
setInterval(tickStatuses, 3000);
