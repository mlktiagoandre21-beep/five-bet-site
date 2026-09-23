const backdrop = document.querySelector('.modal-backdrop');
const API_BASE_URL = 'https://staging-api.fivebet.com/v1';
const modalTitle = document.querySelector('#modal-title');
const modalSubtitle = document.querySelector('.modal-subtitle');
const modalButtons = document.querySelectorAll('[data-modal]');
const closeModal = () => { backdrop.hidden = true; document.body.style.overflow = ''; };
const openModal = (type) => {
  backdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  const login = type === 'login';
  document.querySelectorAll('.register-field').forEach(field => { field.hidden = login; });
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
const loadWalletBalance = async token => {
  const response = await fetch(`${API_BASE_URL}/wallet/balance`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error('Não foi possível consultar o saldo.');
  const wallet = await response.json();
  demoBalance = Number(wallet.total_balance ?? 0);
  updateBalance();
};

document.querySelector('.modal form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector('[name="email"]').value.trim();
  const password = form.querySelector('[name="password"]').value;
  const isLogin = modalTitle.textContent === 'Bem-vindo de volta';
  if (!email || password.length < 6) { alert('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.'); return; }

  const payload = isLogin ? { email, password } : {
    nome: form.querySelector('[name="nome"]').value.trim(),
    email,
    password,
    cpf: form.querySelector('[name="cpf"]').value.trim(),
    data_nascimento: form.querySelector('[name="data_nascimento"]').value
  };
  if (!isLogin && (!payload.nome || !payload.cpf || !payload.data_nascimento)) { alert('Preencha nome, CPF e data de nascimento.'); return; }

  try {
    const response = await fetch(`${API_BASE_URL}/${isLogin ? 'auth/login' : 'users'}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Não foi possível concluir a operação.');
    if (isLogin && result.token) { sessionStorage.setItem('fivebet-token', result.token); await loadWalletBalance(result.token); }
    closeModal();
    alert(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!');
  } catch (error) { alert(error.message); }
});
document.querySelectorAll('.category-tabs button').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.category-tabs .selected').classList.remove('selected');
  button.classList.add('selected');
  const category = button.textContent.trim().toLowerCase();
  document.querySelectorAll('.game-card').forEach(card => {
    card.hidden = category !== 'popular' && !card.dataset.category.includes(category);
  });
}));
const walletBalance = document.querySelector('.wallet-balance strong');
let demoBalance = Number(localStorage.getItem('fivebet-balance') || 1000);
const formatMoney = value => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const updateBalance = () => { walletBalance.textContent = formatMoney(demoBalance); };
updateBalance();

const openDemoGame = gameName => {
  const gameBackdrop = document.createElement('div');
  gameBackdrop.className = 'modal-backdrop';
  gameBackdrop.innerHTML = `<section class="demo-game-modal" role="dialog" aria-modal="true" aria-labelledby="demo-game-title"><button class="demo-close" aria-label="Fechar">×</button><p class="eyebrow">Jogo demonstrativo</p><h2 id="demo-game-title">${gameName}</h2><p>Escolha o valor e rode uma partida usando saldo fictício.</p><div class="slot-result">★ ◆ ✦</div><div class="bet-row"><label>Valor da aposta<input class="bet-amount" type="number" min="1" max="${demoBalance}" step="1" value="10"></label><button class="button button-primary spin-button">Jogar</button></div><p class="game-message">Saldo disponível: ${formatMoney(demoBalance)}</p></section>`;
  document.body.append(gameBackdrop);
  const resultElement = gameBackdrop.querySelector('.slot-result');
  const message = gameBackdrop.querySelector('.game-message');
  const close = () => gameBackdrop.remove();
  gameBackdrop.querySelector('.demo-close').onclick = close;
  gameBackdrop.onclick = event => { if (event.target === gameBackdrop) close(); };
  gameBackdrop.querySelector('.spin-button').onclick = () => {
    const amount = Number(gameBackdrop.querySelector('.bet-amount').value);
    if (!amount || amount < 1 || amount > demoBalance) { message.textContent = 'Escolha uma aposta dentro do saldo disponível.'; return; }
    const symbols = ['★', '♦', '♠', '✦', '◆'];
    const result = Array.from({ length: 3 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
    const won = result[0] === result[1] && result[1] === result[2];
    demoBalance += won ? amount * 4 : -amount;
    localStorage.setItem('fivebet-balance', String(demoBalance));
    updateBalance();
    resultElement.textContent = result.join(' ');
    message.textContent = won ? `Você ganhou ${formatMoney(amount * 4)}! Saldo: ${formatMoney(demoBalance)}` : `Rodada perdida. Saldo: ${formatMoney(demoBalance)}`;
  };
};
document.querySelectorAll('.play-button').forEach(button => button.addEventListener('click', () => openDemoGame(button.closest('.game-card').querySelector('h3').textContent)));
const menuToggle = document.querySelector('.menu-toggle');
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    document.querySelector('.main-nav').style.display = open ? '' : 'flex';
  });
}
