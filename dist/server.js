"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const database_1 = require("./config/database");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const lightRoutes_1 = __importDefault(require("./routes/lightRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
exports.io = io;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Connect to database
(0, database_1.connectDB)();
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/lights', lightRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend server is running' });
});
// WebSocket events for real-time updates
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('subscribe-city', (city) => {
        socket.join(`city:${city}`);
        console.log(`Socket ${socket.id} subscribed to city: ${city}`);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map