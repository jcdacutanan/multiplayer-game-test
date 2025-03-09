const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

let counters = { counter1: 0, counter2: 0 };
let playerCount = 0; // Track number of players

server.on('connection', (socket) => {
    if (playerCount >= 2) {
        socket.close(); // Only allow 2 players
        return;
    }

    playerCount++;
    const playerId = playerCount; // Assign Player ID (1 or 2)
    console.log(`Player ${playerId} connected`);

    // Send initial counter and assigned player ID
    socket.send(JSON.stringify({ playerId, counters }));

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            if (typeof data.player !== 'undefined' && typeof data.change === 'number') {
                if (data.player === 1) {
                    counters.counter1 += data.change;
                } else if (data.player === 2) {
                    counters.counter2 += data.change;
                }
                broadcast(counters);
            }
        } catch (error) {
            console.error('Invalid message:', message);
        }
    });

    socket.on('close', () => {
        console.log(`Player ${playerId} disconnected`);
        playerCount--;
    });
});

function broadcast(value) {
    server.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(value));
        }
    });
}

console.log('WebSocket server running on ws://localhost:3000');
