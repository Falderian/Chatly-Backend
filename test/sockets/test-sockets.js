import { io } from 'socket.io-client';

const connectUser = async (email, password) => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.statusText}`);
  }

  const { access_token: token } = await response.json();

  const socket = io('wss://c38a-178-120-215-67.ngrok-free.app', {
    auth: { token },
  });

  socket.on('connect', () => {
    console.log(`Connected to the server as ${email}`);
  });

  socket.on('connect_error', (error) => {
    console.error(`Connection error for ${email}:`, error);
  });

  socket.on('message', console.log);

  return { socket, token };
};

const { token } = await connectUser('Fred_Kemmer@Napoleon.name', '0River22');

const response = await fetch('http://localhost:3000/conversations/user/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
});

const conversations = await response.json();
const conversationId = conversations[0].id;

const newMessage = await fetch('http://localhost:3000/messages/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ conversationId, content: new Date().toString() }),
});

console.log(await newMessage.json());
