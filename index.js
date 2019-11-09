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
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', '*');
        return res.status(200).json({});
    }
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
    if (!name || !email || !password || !sex || !enfermedades || !direccion) return res.send({ error: -1, descripcion: "datos faltantes" })
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
 * OBTENER TODOS LOS SERVICIOS DE UN CLIENTE
 */
app.get('/servicios/cliente/:idCliente', (req, res) => {
    const idC = req.params.idCliente;
    res.send(`Servicios de ${idC}`)
})

/**
 * COMENTAR UN CUIDADOR
 */
app.put('/servicios/cuidador/comentar/:idCuidador', (req, res) => {
    const idC = req.params.idCuidador;
    const comentario = req.body.comentario;
    res.send(`se comentó a ${idC} con: ${comentario}`)
})

/**
 * PUNTUAR UN CUIDADOR
 */
app.put('/servicios/cuidador/puntuar/:idCuidador/:puntuacion', (req, res) => {
    const idC = req.params.idCuidador;
    const puntuacion = req.params.puntuacion;
    res.send(`se puntuó a ${idC} con: ${puntuacion}`)
})

/**
 * CANCELAR UN SERVICIO
 */
app.post('/servicios/cancelar', (req, res) => {
    const idServicio = req.body.id;
    res.send(`se canceló a ${idServicio}`)
})

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
// CUIDADOR
//--------------------------------------------------------------------

/**
 * OBTENER CUIDADOR ESPECIFICO
 */
app.get('/cuidador/:id', (req, res) => {
    const id = req.params.id;
    res.send(`Se obtuvo la info del cuidador ${id}`);
})

/**
 * OBTENER TODOS LOS SERVICIO DEL CUIDADOR
 */
app.get('/servicios/cuidador/:id', (req, res) => {
    const id = req.params.id;
    res.send(`Se obtuvo los servicios del cuidador ${id}`);
})

/**
 * SOLICITAR MATERIAL POR CUIDADOR
 */
app.post('/servicios/cuidador/solicitarMaterial', (req, res) => {
    const idCuidador = req.body.idCuidador;
    const idMaterial = req.body.idMaterial;
    const cantidad = req.body.cantidad;
    res.send(`El cuidador ${idCuidador} solicitó ${cantidad} del material ${idMaterial}`)
})

//--------------------------------------------------------------------
// PERSONAL ADMINISTRATIVO
//--------------------------------------------------------------------

/**
 * OBTENER TODAS LAS SOLICITUDES DE REGISTRO
 */
app.get('/solicitudesRegistro', (req, res) => {
    res.send('Se obtuvieron todas las solicitudes de registro');
})

/**
 * APROBAR UNA SOLICITUD DE REGISTRO DE CLIENTES
 */
app.put('/solicitudesRegistro/aprobar/:id', (req, res) => {
    const idSolicitud = req.params.id;
    res.send(`Se aprobó la solicitud de registro ${idSolicitud}`);
})

/**
 * APROBAR TODAS LAS SOLICITUDES DE REGISTRO DE CLIENTES
 */
app.put('/solicitudesRegistro/aprobar', (req, res) => {
    res.send(`Se aprobó todas las solicitudes de registro`);
})

/**
 * OBTENER SERVICIOS PENDIENTES DE PAGO
 */
app.get('/servicios/pendientesPago', (req, res) => {
    res.send(`Se obtuvieron los servicios pendientes de pago`);
})

/**
 * PAGAR SERVICIO
 */
app.put('/servicios/pagar/:id', (req, res) => {
    const idServicio = req.params.id;
    res.send(`Se pagó el servicio ${idServicio}`);
})


/**
 * OBTENER TODOS LOS SERVICIOS
 */
app.get('/servicios', (req, res) => {
    res.send(`Se obtuvo todos los servicios`);
})

/**
 * OBTENER SOLICITUDES DE MATERIALES PENDIENTES
 */
app.get('/solicitudesMateriales', (req, res) => {
    res.send(`Se obtuvo todas las solicitudes de materiales pendientes`);
})

/**
 * APROBAR SOLICITUD DE MATERIALES PENDIENTES
 */
app.put('/solicitudesMateriales/:id', (req, res) => {
    const idSolicitud = req.params.id;
    res.send(`Se aprobó la solicitud de materiales pendientes ${idSolicitud}`);
})

/**
 * OBTENER INVENTARIO MATERIALES
 */
app.get('/inventario', (req, res) => {
    res.send('se obtuvo todos los materiales')
})

/**
 * COMPRAR MATERIAL
 */
app.put('/inventario/comprar/:id/:cantidad', (req, res) => {
    const idMaterial = req.params.id;
    const cantidad = req.params.cantidad;
    res.send(`se compro ${cantidad} de ${idMaterial}`)
})

//--------------------------------------------------------------------
// ADMINISTRADOR
//--------------------------------------------------------------------

/**
 * OBTENER TODAS LAS SUCURSALES
 */
app.get('/sucursales', (req, res) => {
    res.send('Se obtuvo todas las sucursales')
})

/**
 * DESHABILITAR SUCURSAL
 */
app.put('/sucursales/deshabilitar/:id', (req, res) => {
    const idSucursal = req.params.id;
    res.send(`Se deshabilitó la sucursal ${idSucursal}`);
})

/**
 * CREAR SUCURSAL
 */
app.post('/sucursales', (req, res) => {
    const nombre = req.body.nombre;
    const dir = req.body.direccion;
    res.send(`Se creo la sucursal ${nombre} con direccion: ${dir}`);
})

/**
 * MODIFICAR SUCURSAL
 */
app.put('/sucursales/:id', (req, res) => {
    const idSucursal = req.params.id;
    const nombre = req.body.nombre;
    const dir = req.body.direccion;
    res.send(`Se modificó la sucursal ${idSucursal} con nombre: ${nombre} con direccion: ${dir}`);
})

/**
 * OBTENER EMPLEADOS
 */
app.get('/empleados', (req, res) => {
    res.send('se obtuvo todos los empleados');
})

/**
 * DESHABILITAR EMPLEADO
 */
app.put('/empleados/deshabilitar/:id', (req, res) => {
    const idEmpleado = req.params.id;
    res.send(`Se deshabilitó el empleado ${idEmpleado}`);
})

 /**
 * MODIFICAR EMPLEADO
 */
app.put('/empleados/:id', (req, res) => {
    const idEmpleado = req.params.id;
    // obtener los datos del body
    res.send(`Se deshabilitó el empleado ${idEmpleado}`);
})

 /**
 * CREAR EMPLEADO
 */
app.post('/empleados', (req, res) => {
    const {nombre, puesto, email, password, sucursal, direccion} = req.body;
    res.send(`Se deshabilitó el empleado ${idEmpleado}`);
})

/**
 * OBTENER CATEGORIAS
 */
app.get('/categorias', (req, res) => {
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query("select * from Categoria", (err, result) => {
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
    //res.send('Se obtuvo las categorias');
})

/**
 * ELIMINAR CATEGORIA
 */
app.delete('/categorias/:id', (req, res) => {
    const idCategoria = req.params.id;
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query(`delete from Categoria where id='${idCategoria}'`, (err, result) => {
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
})

/**
 * MODIFICAR CATEGORIA
 */
app.put('/categorias/:id', (req, res) => {
    const idCategoria = req.params.id;
    const {nombre, salarioCuidador, precioCliente} = req.body;
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query(`update Categoria set PrecioCliente='${precioCliente}', PagoCuidador='${salarioCuidador}', nombre='${nombre}' where id='${idCategoria}'`, (err, result) => {
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
})

/**
 * CREAR CATEGORIA
 */
app.post('/categorias', (req, res) => {
    const {nombre, salarioCuidador, precioCliente} = req.body;
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query(`Insert into Categoria(PrecioCliente, PagoCuidador,nombre) values('${precioCliente}', '${salarioCuidador}', '${nombre}')`, (err, result) => {
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
    //res.send(`se creó con nombre: ${nombre}, salarioC: ${salarioCuidador}, precio: ${precioCliente}`)
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