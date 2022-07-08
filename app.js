const config = require(`./config.js`);
const { start, log, end } = require(`./utils/logger.js`);
start(`App`, `Starting server..`, `blue`);

const express = require(`express`);
const path = require(`path`);
const app = express();
app.set(`views`, path.join(__dirname, `views`));
app.set(`view engine`, `ejs`);
app.set(`trust proxy`, true);
app.use(`/static`, express.static(`static`));

app.use((req, res, next) => {
    res.setHeader(`Access-Control-Allow-Origin`, `*`);
    res.setHeader(`Access-Control-Allow-Methods`, `GET, POST, PUT, DELETE, PATCH`);
    res.setHeader(`Access-Control-Allow-Headers`, `Content-Type, authorization `);
    res.setHeader(`Access-Control-Allow-Credentials`, true);

    next();
});

const { walk } = require(`./utils/filesystem.js`);
walk(path.join(__dirname, `routes`)).forEach(file => {
    const relativePath = file.replace(path.join(__dirname, `routes`), ``);
    const routePath = relativePath.split(`\\`).join(`/`).replace(`.js`, ``);
    const routes = require(file);

    routes.forEach(route => {
        if (route.method) app[route.method](route.path ? route.path : routePath, route.run);
    });
});

app.get(`*`, (req, res) => {
    res.status(404).json({
        status: 404,
        message: `You have entered an invalid route!`,
    });
});

app.listen(config.serverPort, (error) => {
    if (error) log(`API`, JSON.stringify(error), `red`);

    end(`API`, `Listening to http://localhost:${config.serverPort}`, `green`);
});