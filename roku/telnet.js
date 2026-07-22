const net = require('net');
const fs = require('fs');

const logStream = fs.createWriteStream('roku_debug.log', { flags: 'a' });

function connect() {
    const client = new net.Socket();
    
    client.connect(8085, '192.168.1.147', function() {
        console.log('Connected to Roku Telnet (Port 8085)');
        logStream.write('Connected to Roku Telnet\n');
    });

    client.on('data', function(data) {
        const text = data.toString();
        process.stdout.write(text);
        logStream.write(text);
    });

    client.on('close', function() {
        setTimeout(connect, 1000);
    });

    client.on('error', function(err) {
        setTimeout(connect, 1000);
    });
}

console.log("Waiting for Roku Dev App to launch on 192.168.1.147:8085...");
connect();
