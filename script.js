// CV Web Pau Alarcón — interactividad sin dependencias
const roles = [
  "Técnico en Sistemas Microinformáticos y Redes",
  "Estudiante de 2º de ASIX",
  "Soporte informático y atención al usuario",
  "Sistemas Windows y Linux · Redes locales"
];
const typingEl = document.getElementById('typing');
let ri = 0, ci = 0, deleting = false;
function typeLoop(){
  const word = roles[ri];
  typingEl.textContent = word.slice(0, ci);
  if(!deleting){
    if(ci < word.length){ ci++; setTimeout(typeLoop, 55); }
    else { deleting = true; setTimeout(typeLoop, 1300); }
  } else {
    if(ci > 0){ ci--; setTimeout(typeLoop, 28); }
    else { deleting = false; ri = (ri+1) % roles.length; setTimeout(typeLoop, 300); }
  }
}
typeLoop();

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); } });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

// Barras de nivel animadas
const barIO = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.fill').forEach(f=>{
        f.style.width = (f.dataset.level || 70) + '%';
      });
      barIO.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.skill-card, .card').forEach(el=>barIO.observe(el));

// Tema claro / oscuro (psicología: oscuro=tech, claro=formal para imprimir)
const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', ()=>{
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  themeBtn.textContent = html.dataset.theme === 'dark' ? '◐' : '☀';
});

// Menú móvil
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');
menuBtn.addEventListener('click', ()=> navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>navLinks.classList.remove('open')));

// Imprimir / PDF
document.getElementById('printBtn').addEventListener('click', ()=> window.print());

// Año
document.getElementById('year').textContent = new Date().getFullYear();

// Copiar email
const EMAIL = "pau20470@gmail.com";
document.getElementById('copyEmailBtn').addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText(EMAIL); alert('Email copiado: ' + EMAIL); }
  catch{ prompt('Copia tu email:', EMAIL); }
});

// Botón subir
const toTop = document.getElementById('toTop');
window.addEventListener('scroll', ()=> toTop.classList.toggle('show', window.scrollY > 600));
toTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// Nav activa según sección
const sections = [...document.querySelectorAll('section[id]')];
const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
window.addEventListener('scroll', ()=>{
  const y = window.scrollY + 120;
  let current = sections[0]?.id;
  sections.forEach(s=>{ if(s.offsetTop <= y) current = s.id; });
  links.forEach(l=> l.style.color = l.getAttribute('href') === '#'+current ? '#22D3EE' : '');
});

// Formulario → abre correo con mensaje pre-rellenado (solo si existe el form)
function sendMail(e){
  e.preventDefault();
  const n = document.getElementById('fName')?.value || '';
  const m = document.getElementById('fMail')?.value || '';
  const t = document.getElementById('fMsg')?.value || '';
  const subject = encodeURIComponent('Contacto web CV — ' + n);
  const body = encodeURIComponent(t + '\n\n— ' + n + ' (' + m + ')');
  window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  return false;
}

// LinkedIn — solo si existe el botón en index.html
const linkedinBtn = document.getElementById('linkedinBtn');
if (linkedinBtn) {
  linkedinBtn.addEventListener('click', (e)=>{
    e.preventDefault(); alert('Perfil de LinkedIn pendiente de completar.');
  });
}
// GitHub usa enlace directo a https://github.com/Tortuanapai (sin interceptar)
