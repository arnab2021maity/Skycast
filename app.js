const express = require('express');
const fs = require('fs');
const requests = require('requests');
const path = require('path');
const app = express();
const port = 3000;


app.use(express.static(__dirname));


const indexFile = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');


const replaceVal = (tempVal, orgVal) => {
    let updatedTemperature = tempVal.replace("{%tempval%}", Math.round(orgVal.main.temp));
    updatedTemperature = updatedTemperature.replace("{%location%}", orgVal.name);
    updatedTemperature = updatedTemperature.replace("{%humidity%}", orgVal.main.humidity);
    updatedTemperature = updatedTemperature.replace("{%windspeed%}", orgVal.wind.speed);
    return updatedTemperature;
};


app.get('/weather', (req, res) => {
    const cityName = req.query.name;
    console.log(`Received city name: ${cityName}`);

    if (!cityName) {
        return res.status(400).send('City name is required');
    }

    const apiKey = 'bdfd38bc4b06626522cf7abd1b030635';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${cityName}&appid=${apiKey}`;

    requests(apiUrl)
        .on('data', (chunk) => {
            const data = JSON.parse(chunk);

            if (data.cod === 200) {
                const updatedHTML = replaceVal(indexFile, data);
                res.send(updatedHTML);
            } else {
                res.status(404).send('City not found');
            }
        })
        .on('end', (err) => {
            if (err) return res.status(500).send('Error fetching weather data');
        });
});


app.get('/', (req, res) => {
    res.send(indexFile);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





