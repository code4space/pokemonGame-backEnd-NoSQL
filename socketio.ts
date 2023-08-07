import socketIo from 'socket.io';
import { Server } from 'http';

const rooms = new Map()

export default function initializeSocketIO(httpServer: Server) {
  const io = new socketIo.Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: any) => {
    console.log('A user connected');

    let userRoom = null;

    socket.on('joinRoom', (data) => {
      for (const [room, users] of rooms.entries()) {
        if (users.length < 2) {
          userRoom = room;
          users.push(socket);
          socket.join(room);
          io.to(room).emit('roomInfo', { roomName: room, users: users.length });
          return;
        }
      }
      const newRoom = Math.random().toString(36).substring(7);
      userRoom = newRoom;
      rooms.set(newRoom, [socket]);
      socket.join(newRoom);
      io.to(newRoom).emit('roomInfo', { roomName: newRoom, users: 1 });
    })

    socket.on('message', (data) => {
      io.to(data.room).emit('message', { username: data.username, message: data.message });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
      cleanupUser(userRoom, socket);
    });
  });

  // Cleanup user data when disconnecting
  function cleanupUser(userRoom, socket) {
    if (userRoom) {
      const usersInRoom = rooms.get(userRoom);
      if (usersInRoom) {
        const index = usersInRoom.indexOf(socket);
        if (index !== -1) {
          usersInRoom.splice(index, 1);
          io.to(userRoom).emit('roomInfo', { roomName: userRoom, users: usersInRoom.length, disconnect: true });
          if (usersInRoom.length === 0) {
            rooms.delete(userRoom);
          }
        }
      }
    }
  }

  return io
}
