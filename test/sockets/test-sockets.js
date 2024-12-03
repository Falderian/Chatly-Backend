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

  const socket = io('http://localhost:1235', {
    auth: { token },
    reconnectionAttempts: 10,
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

const [firstSocket, secondSocket] = await Promise.all([
  connectUser('Xavier_Tromp@yahoo.com', '5Gloria95'),
  connectUser('Shanahan.Branson@yahoo.com', '2Jayce87'),
]);

firstSocket.socket.emit('notificate', { message: 'Hello there', userId: 2 });

const response = await fetch('http://localhost:3000/conversations/user/1', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${firstSocket.token}`,
  },
});

console.log(await response.json());
