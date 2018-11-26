const http = require('http');
const url = require('url');
const io = require('socket.io');
const express = require('express');
const nodeStatic = require('node-static');
const port = process.env.PORT || 5000;

const server = http.createServer(httpHandler);
const socket = io.listen(server);
socket.on('connection', socketHandler);

const staticFiles = new nodeStatic.Server(`./public`);

function httpHandler(req, res) {
    const parsedUrl = url.parse(req.url);
    if (parsedUrl.href === '/index.html') {
        console.log('aasdasd', parsedUrl.path);
        req.addListener('end', function () {
            req.url = parsedUrl.path;
            staticFiles.serve(req, res);
        }).resume();
    }
}
function socketHandler(socket) {
    console.log('Socket Connected');
    function disconnet() {
        console.log('Client disconnected');
    }

    socket.on('typeit', (data) => {
        socket.broadcast.emit('message', data);
    });
    socket.on('disconnect', disconnet);
}

server.listen(port, _ => {
    console.log(`Server listening on port ${port}`);
});

