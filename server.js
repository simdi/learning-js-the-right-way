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
        const wb = XLSX.read(buf, {type:'buffer'});

        fs.appendFile("./data/ward_and_local_governments_in_Nigeria1.json", JSON.stringify(wb.Strings), (err) => {
            if(err) return console.log(err);
            console.log("The file was saved!");
        });
    } else if (parsedUrl.href === '/read-json-file') {
        const file = require('./States, Local Gorvenment Areas, Wards In Nigeria copy.js');

        console.log('file', file);
        const state = file.reduce((a,b) => {
            let state = (b['STATE NAME'] !== '') ? {} : { name: b['STATE NAME'], code: b['STATE CODE'].toString(), lgas: []};
            if (b['STATE NAME'] !== '') {
                let lga = {};
                let ward = {};
                state.name = b['STATE NAME'];
                state.code = b['STATE CODE'].toString();
                state.lgas = [];
                lga.name = b["LGA NAME"];
                lga.code = b["LGA CODE"].toString();
                lga.wards = [];
                ward.name = b["WARD NAME"];
                ward.code = b["WARD CODE"].toString();
                lga.wards.push(ward);
                state.lgas.push(lga);
                a.push(state);
            } else {
                const lastState = a[a.length-1];
                if (b['LGA NAME'] !== '') {
                    let lga = {};
                    let ward = {};
                    lga.name = b["LGA NAME"];
                    lga.code = b["LGA CODE"].toString();
                    lga.wards = [];
                    ward.name = b["WARD NAME"];
                    ward.code = b["WARD CODE"].toString();
                    lga.wards.push(ward);
                    lastState.lgas.push(lga);
                } else {
                    let ward = {};
                    ward.name = b["WARD NAME"];
                    ward.code = b["WARD CODE"].toString();
                    lastState.lgas[lastState.lgas.length-1].wards.push(ward);
                }
            }
            
            return a;
        }, []);

        console.log(state);
        fs.appendFile("./data/ward_and_local_governments_in_Nigeria.json", JSON.stringify(state), (err) => {
            if(err) return console.log(err);
            console.log("The file was saved!");
        });
    } else if (parsedUrl.href === '/add-extra-data') {
        const file = require('./ward_and_local_governments_in_Nigeria.js');

        console.log('File',file);
        const states = file.map(x => {
            x.noOfLga = x.lgas.length;
            x.noOfWards = x.lgas.reduce((a,b) => a += b.wards.length, 0);
            x.noOfPollingUnit = 0;
            x.noOfInecRegVoters = 0;
            x.noOfFdVoters = 0;
            return x;
        });

        console.log('States', states);
        // fs.appendFile("./data/ward_and_local_governments_in_Nigeria_new.js", JSON.stringify(states), (err) => {
        //     if(err) return console.log(err);
        //     console.log("The file was saved!");
        // });
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

