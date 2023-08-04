import socketIo from 'socket.io';
import { Server } from 'http';

export default function initializeSocketIO(httpServer: Server) {
  const io = new socketIo.Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  const rooms = new Map();

  function avaibleRoom(roomName: string, roomNumber: number) {
    const room = roomName + roomNumber
    const isAvaible = rooms.get(room) || []
    if (isAvaible.length < 2) return {avaibleRoom: isAvaible, room}
    else return avaibleRoom(roomName, roomNumber + 1)
  }

  function joinRoom(socket: any, roomName: string, roomNumber: number) {
    const myRoom = avaibleRoom(roomName, roomNumber)
    const roomOccupants = myRoom.avaibleRoom

    console.log(rooms)
    socket.join(myRoom.room);
    
    if (!rooms.get(myRoom.room)?.some(el => el === socket.id)) roomOccupants.push(socket.id); 
    console.log(roomOccupants)
    rooms.set(myRoom.room, roomOccupants);
  }

  io.on('connection', (socket: any) => {
    console.log('A user connected');

    socket.on('joinRoom', (data) => {
      joinRoom(socket, data.room, data.number);
    });

    socket.on('message', (data) => {
      console.log(data)
      io.to(data.room).emit('message', { username: data.username, message: data.message });
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected');
      cleanupUser(socket);
    });
  });

  // Cleanup user data when disconnecting
  function cleanupUser(socket) {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        const roomOccupants = rooms.get(room) || [];
        const index = roomOccupants.indexOf(socket.id);
        if (index !== -1) {
          roomOccupants.splice(index, 1);
          if (roomOccupants.length === 0) {
            rooms.delete(room);
          } else {
            rooms.set(room, roomOccupants);
          }
        }
      }
    }
  }
}
