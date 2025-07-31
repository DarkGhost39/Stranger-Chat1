const socket = io();

// Elements
const homepage = document.getElementById('homepage');
const chatpage = document.getElementById('chatpage');
const startBtn = document.getElementById('startBtn');
const chatTitle = document.getElementById('chatTitle');
const messages = document.getElementById('messages');
const chatMessage = document.getElementById('chatMessage');
const sendBtn = document.getElementById('sendBtn');
const emojiBtn = document.getElementById('emojiBtn');
const maintenanceModal = document.getElementById('maintenanceModal');
const closeModal = document.getElementById('closeModal');
const modalText = document.getElementById('modalText');

let selectedGender = "male";
const genderOptions = document.getElementsByName('gender');

genderOptions.forEach(option => {
  option.addEventListener('change', () => {
    selectedGender = option.value;
  });
});

// Start chat
startBtn.addEventListener('click', () => {
  chatTitle.textContent = `Chat Room (${selectedGender})`;
  homepage.classList.remove('active');
  setTimeout(() => chatpage.classList.add('active'), 100);

  socket.emit('findPartner', selectedGender);
  messages.innerHTML = `<div class="message stranger">Looking for a partner...</div>`;
});

// Incoming messages
socket.on('message', (msg) => {
  appendMessage(msg, 'stranger');
});

sendBtn.addEventListener('click', () => {
  if (chatMessage.value.trim() === '') return;
  appendMessage(chatMessage.value, 'user');
  socket.emit('message', chatMessage.value);
  chatMessage.value = '';
});

emojiBtn.addEventListener('click', () => {
  chatMessage.value += '😊';
  chatMessage.focus();
  emojiBtn.style.transform = 'scale(1.3)';
  setTimeout(() => emojiBtn.style.transform = 'scale(1)', 200);
});

// Append message
function appendMessage(msg, type) {
  const div = document.createElement('div');
  div.classList.add('message', type);
  div.textContent = msg;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Partner found or disconnected
socket.on('partnerFound', () => {
  appendMessage('Partner connected! Say hi 👋', 'stranger');
});

socket.on('waiting', () => {
  modalText.textContent = "Waiting for a partner...";
  showModal();
  setTimeout(hideModal, 1500);
});

socket.on('partnerDisconnected', () => {
  appendMessage('Your partner disconnected ❌', 'stranger');
});

// Report / Block
document.getElementById('blockBtn').addEventListener('click', () => {
  socket.emit('blockPartner');
  showModal();
  modalText.textContent = "You blocked your partner";
});

socket.on('blocked', () => {
  appendMessage("You were blocked ❌", "stranger");
});

// Modal functions
function showModal() {
  maintenanceModal.style.display = 'flex';
  setTimeout(() => maintenanceModal.classList.add('show'), 50);
}

function hideModal() {
  maintenanceModal.classList.remove('show');
  setTimeout(() => maintenanceModal.style.display = 'none', 300);
}

closeModal.addEventListener('click', hideModal);
