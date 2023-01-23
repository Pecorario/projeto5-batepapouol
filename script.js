let messages = [];
let users = [];

let recipient = 'Todos';
let visibility = 'público';

let nickname;

const timeToLoadMessages = 3000;
const timeToRemainLogged = 5000;
const timeToLoadUsers = 10000;

const templateCheck = `<div class="container-check" data-test="check"><img src="assets/check.svg" class="icon-check" /></div>`;

document
  .querySelector('.input-name')
  .addEventListener('keyup', function (event) {
    if (event.code === 'Enter' || event.key === 'Enter') {
      login();
    }
  });

const getError = () => window.location.reload();

const createTimerToLoadMessages = () => {
  setInterval(loadMessages, timeToLoadMessages);
};

const createTimerToRemainLogged = () => {
  setInterval(remainLogged, timeToRemainLogged);
};

const createTimerToLoadUsers = () => {
  setInterval(loadUsers, timeToLoadUsers);
};

const createMessages = () => {
  const messagesList = document.querySelector('main');
  messagesList.innerHTML = ``;

  messages.map(message => {
    if (
      message.type === 'private_message' &&
      (message.to === nickname || message.from === nickname)
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
        <div class="message default" data-test="message">
          <span>(${message.time})</span>&nbsp<strong>${message.from}</strong> para
          <strong>${message.to}:</strong>&nbsp${message.text}
        </div>
      `);
  });

  const lastMessage = document.querySelector('.message:last-child');
  lastMessage.scrollIntoView();
};

const createListOfUsers = () => {
  const listOfUsers = document.querySelector('.people');

  listOfUsers.innerHTML = `
    <li data-test="all" onclick="selectRecipient(this, 'Todos')" class="selected" >
      <ion-icon name="people" class="icon-people"></ion-icon>Todos${templateCheck}
    </li>
  `;

  users.forEach(
    user =>
      (listOfUsers.innerHTML += `
        <li data-test="participant" onclick="selectRecipient(this, '${user.name}')">
          <ion-icon name="person-circle" class="icon-person"></ion-icon>${user.name}
        </li>
      `)
  );
};

const loadMessages = async () => {
  try {
    const response = await axios.get(
      'https://mock-api.driven.com.br/api/v6/uol/messages'
    );

    messages = response.data;
    createMessages();
  } catch (error) {
    getError();
  }
};

const loadUsers = async () => {
  try {
    const response = await axios.get(
      'https://mock-api.driven.com.br/api/v6/uol/participants'
    );

    users = response.data;
    createListOfUsers();
  } catch (error) {
    getError();
  }
};

const loadChat = () => {
  const body = document.querySelector('body');

  body.innerHTML = `
    <div class="page-chat">
      <div class="right-drawer hidden" data-test="overlay">
        <div class="background" onclick="closeRightDrawer()"></div>
        <div class="content">
          <h2>Escolha um contato para enviar mensagem:</h2>
          <ul class="people"></ul>

          <h2>Escolha a visibilidade:</h2>
          <ul class="visibility">
            <li class="public selected" data-test="public" onclick="selectVisibility(this, 'público')">
              <ion-icon name="lock-open" class="icon-unlocked"></ion-icon>Público${templateCheck}
            </li>
            <li class="private" data-test="private" onclick="selectVisibility(this, 'reservadamente')">
              <ion-icon name="lock-closed" class="icon-locked"></ion-icon>Reservadamente
            </li>
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

      <main></main>

      <footer>
        <div class="container-input">
          <input
            type="text"
            class="input-message"
            placeholder="Escreva aqui..."
            data-test="input-message"
          />
          <span data-test="recipient" class="recipient"
            >Enviando para ${recipient} (${visibility})</span>
        </div>
        <ion-icon
          name="paper-plane-outline"
          class="icon-message"
          data-test="send-message"
          onclick="sendMessage()"
        ></ion-icon>
      </footer>
    </div>
  `;

  document
    .querySelector('.input-message')
    .addEventListener('keyup', function (event) {
      if (event.code === 'Enter' || event.key === 'Enter') {
        sendMessage();
      }
    });

  loadMessages();
  createTimerToLoadMessages();
};

const remainLogged = async () => {
  try {
    await axios.post('https://mock-api.driven.com.br/api/v6/uol/status', {
      name: nickname
    });
  } catch (error) {
    alert('Você foi deslogado.');
    getError();
  }
};

const refreshRecipientSpan = () => {
  const spanMessage = document.querySelector('.recipient');
  spanMessage.innerText = `Enviando para ${recipient} (${visibility})`;
};

const selectVisibility = (content, type) => {
  const selectedVisibility = document.querySelector('.visibility li.selected');
  const check = document.querySelector('.visibility .container-check');

  if (selectedVisibility !== null) {
    selectedVisibility.classList.remove('selected');
    check.remove();
  }

  visibility = type;

  content.classList.add('selected');
  content.innerHTML += templateCheck;

  refreshRecipientSpan();
};

const selectRecipient = (content, receiver) => {
  const selectedPerson = document.querySelector('.people li.selected');
  const check = document.querySelector('.people .container-check');

  if (selectedPerson !== null) {
    selectedPerson.classList.remove('selected');
    check.remove();
  }

  recipient = receiver;

  content.classList.add('selected');
  content.innerHTML += templateCheck;

  refreshRecipientSpan();
};

const sendMessage = async () => {
  try {
    const message = document.querySelector('.input-message').value;

    const newMessage = {
      from: nickname,
      to: recipient,
      text: message,
      type: visibility === 'público' ? 'message' : 'private_message'
    };

    await axios.post(
      'https://mock-api.driven.com.br/api/v6/uol/messages',
      newMessage
    );

    loadMessages();

    document.querySelector('.input-message').value = '';
  } catch (error) {
    alert('Houve um erro ao enviar a mensagem. Você foi deslogado.');
    getError();
  }
};

const openRightDrawer = () => {
  const page = document.querySelector('.page-chat');
  const rightDrawer = document.querySelector('.right-drawer');

  page.style.overflow = 'hidden';
  rightDrawer.classList.remove('hidden');
};

const closeRightDrawer = () => {
  const page = document.querySelector('.page-chat');
  const rightDrawer = document.querySelector('.right-drawer');

  page.style.overflow = 'auto';
  rightDrawer.classList.add('hidden');
};

const addLoader = () => {
  const pageLogin = document.querySelector('.page-login');

  pageLogin.innerHTML = `<img src="assets/login-logo.png" alt="Bate papo UOL" />
  <div class="loading">
    <span class="loader"></span>
    <p>Entrando...</p>
  </div>`;
};

const login = async () => {
  try {
    const inputName = document.querySelector('.input-name').value;

    addLoader();

    await axios.post('https://mock-api.driven.com.br/api/v6/uol/participants', {
      name: inputName
    });

    nickname = inputName;

    loadChat();

    remainLogged();
    createTimerToRemainLogged();

    loadUsers();
    createTimerToLoadUsers();
  } catch (error) {
    alert('Nome já em uso. Por favor, escolha outro.');
    getError();
  }
};
