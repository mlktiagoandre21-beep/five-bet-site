const backdrop = document.querySelector('.modal-backdrop');
const authClient = window.supabase.createClient(
  'https://kystaykkobgfqbnrhqvb.supabase.co',
  'sb_publishable_boR0XAkdBRTdZvfto2GlYQ_vOEgh8bz'
);
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
document.querySelector('.modal form').addEventListener('submit', async event => {
  event.preventDefault();
  const email = event.currentTarget.querySelector('input[type="email"]').value.trim();
  const password = event.currentTarget.querySelector('input[type="password"]').value;
  const isLogin = modalTitle.textContent === 'Bem-vindo de volta';

  if (!email || password.length < 6) {
    alert('Informe um e-mail válido e uma senha com pelo menos 6 caracteres.');
    return;
  }

  const result = isLogin
    ? await authClient.auth.signInWithPassword({ email, password })
    : await authClient.auth.signUp({ email, password });
  if (result.error) {
    alert(`Não foi possível ${isLogin ? 'entrar' : 'criar a conta'}: ${result.error.message}`);
    return;
  }

  closeModal();
  alert(isLogin ? 'Login realizado com sucesso!' : 'Conta criada! Verifique seu e-mail para confirmar o cadastro.');
});
document.querySelectorAll('.category-tabs button').forEach(button => button.addEventListener('click', () => { document.querySelector('.category-tabs .selected').classList.remove('selected'); button.classList.add('selected'); }));
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
