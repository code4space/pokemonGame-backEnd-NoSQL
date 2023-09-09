import socketIo from 'socket.io';
import { Server } from 'http';

const rooms = new Map()
const player = new Map()

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

    socket.on('joinRoom', ({ name }) => {
      for (const [room, users] of rooms.entries()) {
        if (users.length < 2) {
          userRoom = room;
          users.push(socket);
          player.get(room).push(name)
          socket.join(room);
          io.to(room).emit('roomInfo', { roomName: room, name: player.get(room) });
          return;
        }
      }
      const newRoom = Math.random().toString(36).substring(7);
      userRoom = newRoom;
      rooms.set(newRoom, [socket]);
      player.set(newRoom, [name]);
      socket.join(newRoom);
      io.to(newRoom).emit('roomInfo', { roomName: newRoom });
    })

    socket.on('message', (data) => {
      io.to(data.room).emit('message', { username: data.username, message: data.message });
    });

    socket.on('opponent-deck', (data) => {
      io.to(data.room).emit('opponent-deck', { opponentDeck: data.opponentDeck, opponentName: data.opponentName });
    })

    socket.on('ready', (data) => {
      io.to(data.room).emit('ready', { readyStatus: data.ready, opponentName: data.opponentName });
    })

    socket.on('add-turn', ({ room, name, pokemon }) => {
      io.to(room).emit('add-turn', { name, pokemon });
    })

    socket.on('set-first-turn', ({ room, name, score }) => {
      io.to(room).emit('set-first-turn', { score, name })
    })

    socket.on('update-pokemon', ({ pokemon, room, name }) => {
      io.to(room).emit('update-pokemon', { pokemon, name })
    })

    socket.on('attack', ({ room, name, target, damage }) => {
      io.to(room).emit('attack', { name, target, damage })
    })

    socket.on('healing-target', ({ room, name, target }) => {
      io.to(room).emit('healing-target', { name, target })
    })

    socket.on('use-item', ({ name, room, itemName }) => {
      io.to(room).emit('use-item', { name, itemName });
    })

    socket.on('use-ability', ({ name, room, abilityName, type }) => {
      io.to(room).emit('use-ability', { name, abilityName, type });
    })

    // if disconnect
    socket.on('disconnect', () => {
      cleanupUser(userRoom, socket);
    });
  });

  function cleanupUser(userRoom, socket) {
    if (userRoom) {
      const usersInRoom = rooms.get(userRoom);
      const playerInRoom = player.get(userRoom);
      if (usersInRoom) {
        const index = usersInRoom.indexOf(socket);
        if (index !== -1) {
          usersInRoom.splice(index, 1);
          playerInRoom.splice(index, 1);
          io.to(userRoom).emit('roomInfo', { roomName: userRoom, users: usersInRoom.length, disconnect: true });
          if (usersInRoom.length === 0) {
            rooms.delete(userRoom);
            player.delete(userRoom);
          }
        }
      }
    }
  }

  return io
}
