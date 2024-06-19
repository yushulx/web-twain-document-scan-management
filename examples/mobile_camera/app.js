const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
app.set('view engine', 'ejs');
const upload = multer({ dest: 'uploads/' });
const db = new sqlite3.Database('image.db');

app.use(express.static('public'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

const connections = new Map();
io.on('connection', (socket) => {
    connections.set(socket.id, socket);
    console.log(socket.id + ' connected');

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        connections.delete(socket.id);
    });

    socket.on('message', (message) => {
        console.log('Message received: ' + message);
        socket.emit('message', 'from server');
    });
});

// Start the server
const port = process.env.PORT || 3000;

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}/`);
});

app.post('/upload', upload.single('image'), (req, res) => {
    const id = req.body.id;
    const { filename, mimetype, size } = req.file;
    db.run('INSERT INTO images (filename, mimetype, size) VALUES (?, ?, ?)',
        [filename, mimetype, size],
        (err) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            connections.get(id).emit('message', JSON.stringify({ 'filename': filename}));
            res.sendStatus(200);
        });
});

app.get('/images', (req, res) => {
    db.all('SELECT * FROM images', (err, rows) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }
        res.json(rows);
    });
});

app.get('/image/:id', (req, res) => {
    const id = req.params.id;
    const imagePath = path.join(__dirname, 'uploads', id);

    db.all('SELECT mimetype FROM images WHERE filename = ?', [id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }

        if (rows.length > 0) {
            let mimetype = rows[0].mimetype;

            fs.readFile(imagePath, (err, data) => {
                if (err) {
                    res.status(404).send('Image not found');
                } else {
                    res.setHeader('Content-Type', mimetype);
                    res.send(data);
                }
            });
        }
        else {
            res.sendStatus(404);
        }
    });

});
