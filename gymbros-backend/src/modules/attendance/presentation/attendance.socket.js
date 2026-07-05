import { gymState } from '../infrastructure/gym.state.js';

export function registerAttendanceSocket(io) {
  const attendanceNamespace = io.of('/attendance');

  attendanceNamespace.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }
    next();
  });

  attendanceNamespace.on('connection', (socket) => {
    console.log('🔗 Client connected to /attendance:', socket.id);

    socket.emit('gym-count-updated', gymState.getCount());

    const codeInfo = gymState.getCodeInfo();
    if (codeInfo.code) {
      socket.emit('new-dynamic-code', codeInfo);
    }

    socket.on('admin-generate-code', () => {
      const { code, expiresAt } = gymState.generateDynamicCode(10);
      console.log(`📝 Admin generate code manual: ${code}`);
      
      
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected from /attendance:', socket.id);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error on /attendance:`, error);
    });
  });
}