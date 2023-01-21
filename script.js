let messages = [];
let nickname, idTimerMessages, idTimerDwellTime;

const createTimerToLoadMessages = () => {
  idTimerMessages = setInterval(() => {
    loadMessages();
  }, 3000);
};

const createTimerToDwellTime = () => {
  idTimerDwellTime = setInterval(() => {
    stillHere();
  }, 5000);
};

const stillHere = async () => {
  try {
    await axios.post('https://mock-api.driven.com.br/api/v6/uol/status', {
      name: nickname
    });
  } catch (error) {
    nickname = '';
    goToLogin();
  }
};

const addLoader = () => {
  const pageLogin = document.querySelector('.page-login');

  pageLogin.innerHTML = `<img src="assets/login-logo.png" alt="Bate papo UOL" />

  <div class="loading">
    <span class="loader"></span>
    <p>Entrando...</p>
  </div>`;
};

const goToLogin = () => {
  const pageLogin = document.querySelector('.page-login');
  const body = document.querySelector('body');

  if (pageLogin !== undefined) {
    pageLogin.innerHTML = `
      <img src="assets/login-logo.png" alt="Bate papo UOL" />

      <main>
        <input
          type="text"
          class="input-name"
          placeholder="Digite seu nome"
          data-test="input-name"
        />
        <button data-test="send-name" onclick="login()">Entrar</button>
      </main>
    `;
  } else {
    body.innerHTML = `
      <div class="page-login">
        <img src="assets/login-logo.png" alt="Bate papo UOL" />

        <main>
          <input
            type="text"
            class="input-name"
            placeholder="Digite seu nome"
            data-test="input-name"
          />
          <button data-test="send-name" onclick="login()">Entrar</button>
        </main>
      </div>
    `;
  }
};

const createMessages = () => {
  const messagesList = document.querySelector('main');

  messages.map(message => {
    if (
      (message.type === 'private_message' && message.from === nickname) ||
      message.to === nickname
    ) {
      return (messagesList.innerHTML += `
        <div class="message privately" data-test="message">
          <span>(${message.time})</span>&nbsp<strong>${message.from}</strong> reservadamente para
          <strong>${message.to}:</strong>&nbsp${message.text}
        </div>
      `);
    }
    if (message.type === 'status') {
      return (messagesList.innerHTML += `
      <div class="message status" data-test="message">
        <span>(${message.time})</span>&nbsp<strong>${message.from}</strong>&nbsp${message.text}
      </div>
      `);
    }
    return (messagesList.innerHTML += `
    <div class="message" data-test="message">
      <span>(${message.time})</span>&nbsp<strong>${message.from}</strong> para
      <strong>${message.text}:</strong>&nbsp${message.text}
    </div>
    `);
  });

  const lastMessage = document.querySelector('.message:last-child');
  lastMessage.scrollIntoView();
};

const loadMessages = async () => {
  try {
    const response = await axios.get(
      'https://mock-api.driven.com.br/api/v6/uol/messages'
    );

    messages = response.data;

    createMessages();
  } catch (error) {
    console.log(error);
  }
};

const goToChat = () => {
  const body = document.querySelector('body');

  body.innerHTML = `
    <div class="page-chat">
      <div class="right-drawer hidden" data-test="overlay">
        <div class="background" onclick="closeRightDrawer()"></div>
        <div class="content">
          <h2>Escolha um contato para enviar mensagem:</h2>
          <ul class="people">
          </ul>

          <h2>Escolha a visibilidade:</h2>
          <ul class="visibility">
          </ul>
        </div>
      </div>

      <header>
        <img src="assets/logo.png" alt="Bate papo UOL" />
        <ion-icon
          name="people"
          class="icon-people"
          data-test="open-participants"
          onclick="openRightDrawer()"
        ></ion-icon>
      </header>

      <main>
      </main>

      <footer>
        <div class="container-input">
          <input
            type="text"
            placeholder="Escreva aqui..."
            data-test="input-message"
          />
          <span data-test="recipient"
            >Enviando para Maria (reservadamente)</span
          >
        </div>
        <ion-icon
          name="paper-plane-outline"
          class="icon-message"
          data-test="send-message"
        ></ion-icon>
      </footer>
    </div>
  `;

  loadMessages();
  createTimerToLoadMessages();
};

const login = async () => {
  const inputName = document.querySelector('.input-name').value;
  try {
    addLoader();

    await axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', {
      name: inputName
    });

    nickname = inputName;
    goToChat();
    createTimerToDwellTime();
  } catch (error) {
    nickname = '';
    goToLogin();
  }
};
