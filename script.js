const backdrop = document.querySelector('.modal-backdrop');
const modalTitle = document.querySelector('#modal-title');
const modalSubtitle = document.querySelector('.modal-subtitle');
const modalButtons = document.querySelectorAll('[data-modal]');
const closeModal = () => { backdrop.hidden = true; document.body.style.overflow = ''; };
const openModal = (type) => {
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  const login = type === 'login';
  modalTitle.textContent = login ? 'Bem-vindo de volta' : 'Crie sua conta';
  modalSubtitle.textContent = login ? 'Acesse sua conta para continuar.' : 'Preencha seus dados para começar.';
  document.querySelector('.form-switch').innerHTML = login ? 'Ainda não possui uma conta? <button type="button" data-modal="register">Criar conta</button>' : 'Já possui uma conta? <button type="button" data-modal="login">Entrar</button>';
  document.querySelector('.modal form .button').innerHTML = login ? 'Entrar <span>→</span>' : 'Continuar <span>→</span>';
  document.querySelectorAll('[data-modal]').forEach(button => button.onclick = () => openModal(button.dataset.modal));
};
modalButtons.forEach(button => button.addEventListener('click', () => openModal(button.dataset.modal)));
document.querySelector('.modal-close').addEventListener('click', closeModal);
backdrop.addEventListener('click', event => { if (event.target === backdrop) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
document.querySelector('.modal form').addEventListener('submit', event => {
  event.preventDefault();
  const email = event.currentTarget.querySelector('input[type="email"]').value.trim();
  const password = event.currentTarget.querySelector('input[type="password"]').value;
  const isLogin = modalTitle.textContent === 'Bem-vindo de volta';
  const storedUser = JSON.parse(localStorage.getItem('fivebet-user') || 'null');

  if (!email || password.length < 6) {
    alert('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.');
    return;
  }

  if (isLogin && (!storedUser || storedUser.email !== email || storedUser.password !== password)) {
    alert('Conta não encontrada. Crie sua conta primeiro neste navegador.');
    return;
  }

  localStorage.setItem('fivebet-user', JSON.stringify({ email, password }));
  closeModal();
  alert(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!');
});
document.querySelectorAll('.category-tabs button').forEach(button => button.addEventListener('click', () => { document.querySelector('.category-tabs .selected').classList.remove('selected'); button.classList.add('selected'); }));
const menuToggle = document.querySelector('.menu-toggle');
menuToggle.addEventListener('click', () => { const open = menuToggle.getAttribute('aria-expanded') === 'true'; menuToggle.setAttribute('aria-expanded', String(!open)); document.querySelector('.main-nav').style.display = open ? '' : 'flex'; document.querySelector('.main-nav').style.position = open ? '' : 'absolute'; document.querySelector('.main-nav').style.top = open ? '' : '81px'; document.querySelector('.main-nav').style.left = open ? '' : '0'; document.querySelector('.main-nav').style.right = open ? '' : '0'; document.querySelector('.main-nav').style.padding = open ? '' : '25px 8vw'; document.querySelector('.main-nav').style.background = open ? '' : '#fbfaf7'; });
