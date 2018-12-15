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
        const file1 = require('./ward_and_local_governments_in_nigeria_with_country_statistics.js');
        const file2 = require('./complete_polling_unit.js');

        console.log('file', file1);
        console.log('file', file2);

        for(let i = 0; i < file2.length; i++) {
            const b = file2[i];
            for(let j = 0; j < file1.states.length; j++) {
                const a = file1.states[j];
                // Get State
                if (b['STATE NAME'] === a.name) {
                    for(let k = 0; k < a.lgas.length; k++) {
                        const c = a.lgas[k];
                        // Get LGA
                        if (b['LGA CODE'] === parseInt(c.code)) {
                            for(let l = 0; l < c.wards.length; l++) {
                                const d = c.wards[l];
                                // Get Ward
                                if (b['WARD CODE'] === parseInt(d.code)) {
                                    let pollingUnit = {};
                                    pollingUnit.name = b["POLLING STATION LOCATION/NAME"];
                                    pollingUnit.code = b["POLLING STATION CODE"].toString();
                                    pollingUnit.voters = [];
                                    pollingUnit.GIS = {};
                                    pollingUnit.noOfInecRegVoters = 0;
                                    pollingUnit.noOfFdVoters = 0;
                                    
                                    if (d.pollingUnits) {
                                        d.pollingUnits.push(pollingUnit);
                                    } else {
                                        d.pollingUnits = [];
                                        d.pollingUnits.push(pollingUnit);
                                    }
                                    d.noOfPollingUnits ? d.noOfPollingUnits += 1: d.noOfPollingUnits = 1;
                                    c.noOfPollingUnits ? c.noOfPollingUnits += 1: c.noOfPollingUnits = 1;
                                    a.noOfPollingUnits ? a.noOfPollingUnits += 1: a.noOfPollingUnits = 1;
                                    break;
                                }
                            }
                            break;
                        }
                    }
                    break;
                }
            }
        }


        console.log('States', file1);
        // Get the total of all polling units to the country level
        file1.noOfPollingUnits = file1.states.reduce((a,b) => a += b.noOfPollingUnits, 0);

        console.log('Country', file1);

        fs.appendFile("./data/complete_polling_unit_with_statistics.js", JSON.stringify(file1), (err) => {
            if(err) return console.log(err);
            console.log("The file was saved!");
        });
        
        // const state = file.reduce((a,b) => {
        //     let state = (b['STATE NAME'] !== '') ? {} : { name: b['STATE NAME'], code: b['STATE CODE'].toString(), lgas: []};
        //     if (b['STATE NAME'] !== '') {
        //         let lga = {};
        //         let ward = {};
        //         state.name = b['STATE NAME'];
        //         state.code = b['STATE CODE'].toString();
        //         state.lgas = [];
        //         lga.name = b["LGA NAME"];
        //         lga.code = b["LGA CODE"].toString();
        //         lga.wards = [];
        //         ward.name = b["WARD NAME"];
        //         ward.code = b["WARD CODE"].toString();
        //         lga.wards.push(ward);
        //         state.lgas.push(lga);
        //         a.push(state);
        //     } else {
        //         const lastState = a[a.length-1];
        //         if (b['LGA NAME'] !== '') {
        //             let lga = {};
        //             let ward = {};
        //             lga.name = b["LGA NAME"];
        //             lga.code = b["LGA CODE"].toString();
        //             lga.wards = [];
        //             ward.name = b["WARD NAME"];
        //             ward.code = b["WARD CODE"].toString();
        //             lga.wards.push(ward);
        //             lastState.lgas.push(lga);
        //         } else {
        //             let ward = {};
        //             ward.name = b["WARD NAME"];
        //             ward.code = b["WARD CODE"].toString();
        //             lastState.lgas[lastState.lgas.length-1].wards.push(ward);
        //         }
        //     }
            
        //     return a;
        // }, []);

        // console.log(state);
        // fs.appendFile("./data/ward_and_local_governments_in_Nigeria.json", JSON.stringify(state), (err) => {
        //     if(err) return console.log(err);
        //     console.log("The file was saved!");
        // });
    } else if (parsedUrl.href === '/add-extra-data') {
        const file = require('./ward_and_local_governments_in_Nigeria_new.js');

        console.log('File',file);

        // Get statistics in relation to the state
        const states = file.map(x => {
            x.noOfLgas = x.lgas.length;
            x.noOfWards = x.lgas.reduce((a,b) => a += b.wards.length, 0);
            x.noOfPollingUnits = 0;
            x.noOfInecRegVoters = 0;
            x.noOfFdVoters = 0;
            return x;
        });
        console.log('States', states);

        // Get statistics in relation to the country
        const countryObj = {
            name: 'Nigeria',
            states: states,
            noOfLgas: states.reduce((a,b) => a += b.noOfLgas, 0),
            noOfWards: states.reduce((a,b) => a += b.noOfWards, 0),
            noOfPollingUnits: states.reduce((a,b) => a += b.noOfPollingUnits, 0)
        };

        console.log('CountryObj', countryObj);

        fs.appendFile("./data/ward_and_local_governments_in_nigeria_with_country_statistics.js", JSON.stringify(countryObj), (err) => {
            if(err) return console.log(err);
            console.log("The file was saved!");
        });
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

