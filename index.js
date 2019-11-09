const express = require('express');
const app = express();
const sql = require('mssql');

const sqlConnectionString = 'Server=swdesign-db.clffvzjinwhe.us-east-2.rds.amazonaws.com;Database=RedCuido;User Id=admin;Password=Admin420; Trusted_Connection=True;';
const pool = new sql.ConnectionPool(sqlConnectionString);
const poolConnect = pool.connect();

// PLANTILLA PARA CONEXIÓN CON LA BASE DE DATOS
/*
poolConnect.then(() => {
    console.log('Conectado');
    const request = new sql.Request(pool);
    request.query("Insert into TipoServicio(Descripcion) values('Adulto mayor')", (err, result) => {
        if(err) {
            console.log(err);
            return;
        }
        console.log(result);
        res.send(result.recordset);
    });
}).catch(err => {
    console.log(err);
});
 */

pool.on('error', err => {
    console.log("error al crear el pool");
    pool.close();
});

// con esto se puede usar el req.body
app.use(express.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "YOUR-DOMAIN.TLD"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/pruebaBase', (req, res) => {
    poolConnect.then(() => {
        console.log('Conectado');
        const request = new sql.Request(pool);
        request.query("Insert into TipoServicio(Descripcion) values('Adulto mayor')", (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
            res.send(result.recordset);
        });
    }).catch(err => {
        console.log(err);
    });
});

//--------------------------------------------------------------------
// LOGIN Y REGISTRO
//--------------------------------------------------------------------

/**
 * LOGIN
 * Funcion para realizar la validacion del login
 * se debe retornar el tipo de usuario para así saber
 * si es administrador, personalAdministrativo, cliente 
 * o cuidador
 */
app.post('/usuario/login', (req, res) => {
    if (!req.body.email || !req.body.password) return res.send({ error: -1, descripcion: "datos faltantes" })
    var { email, password } = req.body; // variables para realizar la validacion

    res.send(`Email: ${email}, Pass: ${password}`);
});

/**
 * REGISTRO CLIENTES (SOLICITUD)
 * Esta funcion es para enviar una solicitud de registro
 * que será aceptada por el personal administrativo
 */
app.post('/usuario/registro', (req, res) => {
    var { name, email, password, sex, enfermedades, direccion } = req.body;
    res.send(req.body);
});

//--------------------------------------------------------------------
// CLIENTE
//--------------------------------------------------------------------
/**
 * OBTENER INFORMACION DE CLIENTE
 * Esta es para obtener toda la información del cliente para
 * mostrarla en la interfaz
 */
app.get('/usuario/:email', (req, res) => {
    var emailUsuario = req.params.email;
    res.send(emailUsuario);
});

/**
 * OBTENER INFO DE CUIDADORES
 * Devolver toda la info de los cuidadores
 */
app.get('/cuidador/top', (req, res) => {
    res.send('Todos los cuidadores');
});

//--------------------------------------------------------------------
// SERVICIOS
//--------------------------------------------------------------------

/**
 * AGREGAR NUEVO TIPO SERVICIO
 */
app.post('/servicios/nuevotipo', (req, res) => {
    console.log(req.body);
    if (!req.body.descripcion) return res.send({ error: -1, descripcion: "datos faltantes" })
    let { descripcion } = req.body;
    poolConnect.then(() => {
        console.log('Conectado');
        const request = new sql.Request(pool);
        request.query(`Insert into TipoServicio(Descripcion) values('${descripcion}')`, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
            res.send(result.recordset);
        });
    }).catch(err => {
        console.log(err);
    });
});

/**
 * OBTENER TIPO DE SERVICIOS
 */
app.get('/servicios/tipo', (req, res) => {
    poolConnect.then(() => {
        console.log('Conectado');
        const request = new sql.Request(pool);
        request.query(`select Descripcion from TipoServicio`, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
            res.send(result.recordset);
        });
        /*let result = request.input('id', sql.Int, 1).execute('sp_EnfermedadSelect');
        res.send(result);*/
    }).catch(err => {
        console.log(err);
    });
})

//--------------------------------------------------------------------
// ENFERMEDADES
//--------------------------------------------------------------------

/**
 * INSERTAR ENFERMEDAD
 */
app.post('/enfermedad', (req, res) => {
    const descrip = req.body.descripcion;
    console.log(`Antes de: ${descrip}`)
    poolConnect.then(() => {
        console.log(`Despues de: ${descrip}`)
        const request = new sql.Request(pool);
        let result = request.input('Descripcion', sql.VarChar, descrip).execute('sp_EnfermedadInsert');
        res.send(result);
    }).catch(err => {
        console.log(err);
    });
})

/**
 * OBTENER ENFERMEDAD
 */
app.get('/enfermedad', (req, res) => {
    //const descrip = req.body.descripcion;
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query(`select * from Enfermedad`, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
            res.send(result.recordset);
        });
    }).catch(err => {
        console.log(err);
    });
})

/**
 * OBTENER ENFERMEDAD ESPECÍFICA
 */
app.get('/enfermedad/:id', (req, res) => {
    const id = req.params.id;
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query(`select * from Enfermedad where id='${id}'`, (err, result) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log(result);
            res.send(result.recordset);
        });
    }).catch(err => {
        console.log(err);
    });
})

/**
 * BORRAR ENFERMEDAD ESPECÍFICA
 */
app.delete('/enfermedad/:id', (req, res) => {
    const id = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, id).execute('sp_EnfermedadDelete');
    res.send(result);
})

/**
 * ACTUALIZAR ENFERMEDAD ESPECÍFICA
 */
app.put('/enfermedad/:id', (req, res) => {
    const id = req.params.id;
    const descrip = req.body.descripcion;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, id).input('Descripcion', sql.VarChar, descrip).execute('sp_EnfermedadUpdate');
    res.send(result);
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Escuchando en puerto ${PORT} ...`) })