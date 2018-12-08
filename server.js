const http = require('http');
const url = require('url');
const io = require('socket.io');
const express = require('express');
const nodeStatic = require('node-static');
const port = process.env.PORT || 5000;
const fs = require('fs');
const XLSX = require('xlsx');
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
    } else if (parsedUrl.href === '/read-excel-file') {
        // Read excel file
        const buf = fs.readFileSync('./States, Local Gorvernment Areas, Wards in Nigeria copy.xlsx');
        console.log('Buf', buf.toString());
        const wb = XLSX.read(buf, {type:'buffer'});
        console.log('wb', wb);
        console.log('Strings', JSON.stringify(wb.Strings));
        // const toJson = XLSX.utils.sheet_to_json(wb);
        
        // console.log('ToJson', toJson);

        // fs.appendFile("./data/ward_and_local_governments_in_Nigeria1.json", JSON.stringify(wb.Strings), (err) => {
        //     if(err) return console.log(err);
        //     console.log("The file was saved!");
        // });
        // Write to file
        // wb.Strings.forEach(element => {
        //     console.log(element);
        //     fs.appendFile("./data/ward_and_local_governments_in_Nigeria3.json", element, (err) => {
        //         if(err) return console.log(err);
        //         console.log("The file was saved!");
        //     });
        // });
        // res.send('Done');
        // process.exit(1);
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

