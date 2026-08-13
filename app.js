const state = { step: 1, answers: { flexibility: null, extras: null }, courses: [] };
const questions = {
  1: { key: 'flexibility', title: 'How much flexibility do you need for your driving lessons?', help: 'Pick the pace that fits your week.', options: [
    { value: 'fixed', label: 'I have a set schedule', detail: '& want the cheapest option.', icon: '◷' },
    { value: 'flexible', label: 'I need total flexibility', detail: '(weekends, evenings).', icon: '✦' }
  ]},
  2: { key: 'extras', title: 'Do you want extra practice time or premium cars?', help: 'Your confidence, your call.', options: [
    { value: 'simple', label: 'No, just get me my license.', detail: 'Keep it focused and simple.', icon: '→' },
    { value: 'premium', label: 'Yes! Give me extra hours', detail: 'or let me drive premium cars.', icon: '✦' }
  ]}
};

async function loadCourses() {
  try { state.courses = await fetch('courses.json').then(r => r.json()); }
  catch { state.courses = []; }
}
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function startQuiz() { state.step = 1; state.answers = { flexibility: null, extras: null }; renderQuestion(); showScreen('quiz'); }
function renderQuestion() {
  const q = questions[state.step], percent = state.step * 50;
  document.getElementById('step-label').textContent = `Step ${state.step} of 2`;
  document.getElementById('step-percent').textContent = `${percent}%`;
  document.getElementById('progress-fill').style.width = `${percent}%`;
  document.getElementById('question-content').innerHTML = `<p class="quiz-kicker">MAKE IT YOURS</p><h2>${q.title}</h2><p class="quiz-help">${q.help}</p><div class="options">${q.options.map(o => `<button class="option" data-answer="${o.value}"><span class="option-icon">${o.icon}</span><span><strong>${o.label}</strong><small>${o.detail}</small></span><b>→</b></button>`).join('')}</div>`;
  document.querySelectorAll('[data-answer]').forEach(b => b.addEventListener('click', () => answer(b.dataset.answer)));
}
function answer(value) {
  state.answers[questions[state.step].key] = value;
  if (state.step === 1) { state.step = 2; renderQuestion(); }
  else renderResults();
}
function recommendedId() {
  const { flexibility, extras } = state.answers;
  if (extras === 'premium') return 'vip';
  if (flexibility === 'flexible') return 'standard';
  return 'basic';
}
function renderResults() {
  const pick = recommendedId();
  const selected = state.courses.find(c => c.id === pick);
  document.getElementById('result-copy').textContent = `${selected.name} is built for your ${state.answers.flexibility === 'flexible' ? 'on-the-go' : 'steady'} schedule. Start when you’re ready.`;
  document.getElementById('pricing-grid').innerHTML = state.courses.map(course => {
    const match = course.id === pick;
    const popular = course.id === 'standard';
    return `<article class="price-card ${match ? 'recommended' : ''}">${popular ? '<div class="badge">MOST POPULAR</div>' : ''}${match ? '<div class="match-label">YOUR MATCH</div>' : ''}<p class="course-tag">${course.tag}</p><h3>${course.name}</h3><p class="course-description">${course.description}</p><div class="price"><span>${course.price.toLocaleString('cs-CZ')}</span> Kč</div><ul>${course.features.map(f => `<li>✓ ${f}</li>`).join('')}</ul><p class="fit">${course.fit}</p><button class="book-button" data-book="${course.name}">Book Now <span>→</span></button></article>`;
  }).join('');
  document.querySelectorAll('[data-book]').forEach(b => b.addEventListener('click', () => book(b.dataset.book)));
  showScreen('result');
}
function book(course) { const toast = document.getElementById('toast'); toast.textContent = `${course} selected — we’ll be in touch!`; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3500); }
document.querySelectorAll('[data-start-quiz]').forEach(b => b.addEventListener('click', startQuiz));
document.querySelector('[data-back]').addEventListener('click', () => state.step === 1 ? showScreen('home') : (state.step = 1, renderQuestion()));
document.querySelector('[data-restart]').addEventListener('click', startQuiz);
loadCourses();
