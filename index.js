const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const dbConfig = {
    host: 'nodemysql12.mysql.database.azure.com',
    user: 'mastero',
    password: 'Alejandrof15',
    database: 'test',
    port: 3306,
    ssl: true
};

const pool = mysql.createPool(dbConfig);

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.all('/', (req, res) => {
    console.log("Just got a request!");
    res.send('cotizador.cloud APi Works');
});

app.get('/componentes', (req, res) => {
    pool.query('SELECT * FROM componentes', (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/usuarios/:id', (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM componentes WHERE id = ?', id, (error, results, fields) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('No se encontró ningún usuario con el ID proporcionado.');
        return;
      }
      res.send(results[0]);
    });
});

app.get('/modelo/:modelo', (req, res) => {
    const modelo = req.params.modelo;
    const query = 'SELECT * FROM componentes WHERE modelo LIKE ?';
    const searchTerm = `%${modelo}%`;
    pool.query(query, searchTerm, (error, results, fields) => {
      if (error) {
        console.error('Error al obtener datos de la base de datos:', error);
        res.status(500).send('Error al obtener datos de la base de datos.');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('No se encontró ningún usuario con el ID proporcionado.');
        return;
      }
      res.send(results[0]);
    });
});

app.get('/procesadores', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, img, consumo, socket FROM componentes WHERE tipo = 'procesador'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/motherboards', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, consumo, socket, img, rams FROM componentes WHERE tipo = 'motherboard'", (error, results, fields) => { 
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/rams', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, img, consumo, rams FROM componentes WHERE tipo = 'ram'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/almacenamientos', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, ing, consumo FROM componentes WHERE tipo = 'almacenamiento'", (error, results, fields) => { 
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/disipadores', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'disipador'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/fuentes', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, consumo, img, potencia FROM componentes WHERE tipo = 'psu'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.get('/graficas', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'gpu'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});


app.get('/gabinetes', (req, res) => {
    pool.query("SELECT modelo, precio, tienda, url, img, consumo FROM componentes WHERE tipo = 'gabinete'", (error, results, fields) => {
        if (error) {
            console.error('Error al obtener datos de la base de datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.post('/', (req, res) => {
    const data = req.body;
    pool.query('INSERT INTO componentes SET ?', data, (error, results, fields) => {
        if (error) {
            console.error('Error al insertar datos en la base de datos:', error);
            res.status(500).send('Error al insertar datos en la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.post('/guardar-configuracion', (req, res) => {
    const config = req.body;

    pool.query('INSERT INTO configuraciones SET ?', { jsonConfig: JSON.stringify(config) }, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
            return;
        }

        const configId = results.insertId; // Obtiene el ID asignado a la nueva configuración
        const configUrl = `https://cotizador.cloud/builds/${configId}`; // Construye la URL con el ID

        res.status(200).json({ message: 'Configuración guardada con éxito', url: configUrl });
    });
});

app.get('/recuperar-configuracion/:id', (req, res) => {
    const configId = req.params.id;

    pool.query('SELECT jsonConfig, fechaHora FROM configuraciones WHERE id = ?', configId, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.status(500).send('Error interno del servidor');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Configuración no encontrada');
            return;
        }

        const configData = JSON.parse(results[0].jsonConfig);
        const fechaHora = results[0].fechaHora;
        res.status(200).json({ configData, fechaHora });
    });
});

app.put('/:id', (req, res) => {
    const id = req.params.id;
    const data = req.body;
    pool.query('UPDATE componentes SET ? WHERE id = ?', [data, id], (error, results, fields) => {
        if (error) {
            console.error('Error al actualizar datos en la base de datos:', error);
            res.status(500).send('Error al actualizar datos en la base de datos.');
            return;
        }
        res.send(results);
    });
});

app.delete('/:id', (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM componentes WHERE id = ?', id, (error, results, fields) => {
        if (error) {
            console.error('Error al eliminar datos de la base de datos:', error);
            res.status(500).send('Error al eliminar datos de la base de datos.');
            return;
        }
        res.send(results);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
