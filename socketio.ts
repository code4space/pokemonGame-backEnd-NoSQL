import socketIo from 'socket.io';
import { Server } from 'http';

const rooms = new Map()

export default function initializeSocketIO(httpServer: Server) {
  const io = new socketIo.Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: any) => {
    let userRoom = null;

    socket.on('joinRoom', () => {
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

    socket.on('opponent-name', (data) => {
      io.to(data.room).emit('opponent-name', { opponentName: data.username });
    });

    socket.on('opponent-deck', (data) => {
      io.to(data.room).emit('opponent-deck', { opponentDeck: data.opponentDeck, opponentName: data.opponentName });
    })

    socket.on('ready', (data) => {
      io.to(data.room).emit('ready', { readyStatus: data.ready, opponentName: data.opponentName });
    })

    socket.on('add-turn', ({ room, name }) => {
      io.to(room).emit('add-turn', { name });
    })

    socket.on('set-first-turn', ({ room, opponentName }) => {
      const random = (Math.random() * 100)
      io.to(room).emit('set-first-turn', { score: random, name: opponentName })
    })

    socket.on('update-pokemon', ({ pokemon, room, name }) => {
      io.to(room).emit('update-pokemon', { pokemon, name })
    })

    socket.on('attack', ({ room, name, target, damage }) => {
      io.to(room).emit('attack', { name, target, damage })
    })

    socket.on('disconnect', () => {
      cleanupUser(userRoom, socket);
    });
  });

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
