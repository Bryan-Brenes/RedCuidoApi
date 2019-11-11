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
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', '*');
        return res.status(200).json({});
    }
    next();
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
app.post('/cliente/getPassword', (req, res) => {
    if (!req.body.email) return res.send({ error: -1, descripcion: "datos faltantes" })
    var { email } = req.body; // variables para realizar la validacion

    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query(`select Password from Cliente where Email='${email}'`, (err, result) => {
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

    //res.send(`Email: ${email}, Pass: ${password}`);
});

app.get('/login/:email', (req, res) => {
    const email = req.params.email;
    const request = new sql.Request(pool);
    let result = request.input('email', sql.VarChar, email).execute('sp_LoginInfo').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * REGISTRO CLIENTES (SOLICITUD)
 * Esta funcion es para enviar una solicitud de registro
 * que será aceptada por el personal administrativo
 */
app.post('/cliente/registro', (req, res) => {
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
app.get('/cliente/:email', (req, res) => {
    var emailUsuario = req.params.email;
    const request = new sql.Request(pool);
    let result = request.input('email', sql.VarChar, emailUsuario).execute('sp_getClient').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
});

/**
 * OBTENER TOP DE CUIDADORES
 * Devolver toda la info de los mejores cuidadores
 */
app.get('/cuidador/top', (req, res) => {
    const request = new sql.Request(pool);
    let result = request.execute('sp_TopCuidadores').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
});

//--------------------------------------------------------------------
// SERVICIOS
//--------------------------------------------------------------------

/**
 * OBTENER TODOS LOS SERVICIOS DE UN CLIENTE
 */
app.get('/servicios/cliente/:idCliente', (req, res) => {
    const idC = req.params.idCliente;
    const request = new sql.Request(pool);
    let result = request.input('idCliente', sql.Int, idC).execute('sp_GetService').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * COMENTAR UN SERVICIO
 */
app.put('/servicios/cuidador/comentar/:idServicio', (req, res) => {
    const idS = req.params.idServicio;
    const comentario = req.body.comentario;
    const request = new sql.Request(pool);
    let result = request.input('idServicio', sql.Int, idS).input('comentario', sql.VarChar, comentario).execute('sp_ComentarServicio').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * PUNTUAR UN SERVICIO
 */
app.put('/servicios/cuidador/puntuar/:idServicio/:puntuacion', (req, res) => {
    const idS = req.params.idServicio;
    const puntuacion = req.params.puntuacion;
    const request = new sql.Request(pool);
    let result = request.input('idServicio', sql.Int, idS).input('puntuacion', sql.TinyInt, puntuacion).execute('sp_PuntuarServicio').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * CANCELAR UN SERVICIO
 */
app.put('/servicios/cancelar/:id', (req, res) => {
    const idServicio = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('idServicio', sql.Int, idServicio).execute('sp_CancelarServicio').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
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
app.get('/cuidador/:email', (req, res) => {
    const email = req.params.email;
    const request = new sql.Request(pool);
    let result = request.input('email', sql.VarChar, email).execute('sp_GetCuidador').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * OBTENER COMENTARIOS DE CUIDADOR ESPECÍFICO
 */
app.get('/cuidador/comentarios/:idCuidador', (req, res) => {
    const idCuidador = req.param.idCuidador;
    const request = new sql.Request(pool);
    let result = request.input('idCuidador', sql.Int, idCuidador).execute('sp_getComentarios').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * OBTENER TODOS LOS SERVICIO DEL CUIDADOR
 */
app.get('/servicios/cuidador/:id', (req, res) => {
    const id = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('idCuidador', sql.Int, id).execute('sp_GetServiciosCuidador').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * SOLICITAR MATERIAL POR CUIDADOR
 */
app.post('/servicios/cuidador/solicitarMaterial', (req, res) => {
    const idCuidador = req.body.idCuidador;
    const idMaterial = req.body.idMaterial;
    const cantidad = req.body.cantidad;
    const request = new sql.Request(pool);
    let result = request.input('idMaterial', sql.Int, idMaterial).input('cantidad', sql.Int, cantidad).input('idCuidador', sql.Int, idCuidador).execute('sp_SolicitarMaterial').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
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
 * NUEVO MATERIAL -- Revisar, falta actualizar inventario en BD
 */
app.post('/inventario', (req, res) => {
    const nombre = req.body.nombre;
    const cantidad = req.body.cantidad;
    const request = new sql.Request(pool);
    let result = request.input('descripcion', sql.VarChar, nombre).execute('sp_MaterialInsert').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * BORRAR MATERIAL
 */
app.delete('/inventario/:id', (req, res) => {
    const id = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, id).execute('sp_MaterialDelete').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
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
 * OBTENER SUCURSAL ESPECIFICA
 */
app.get('/sucursales/:id', (req, res) => {
    const id = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, id).execute('sp_CentroCuidoSelect').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * OBTENER TODAS LAS SUCURSALES
 */
app.get('/sucursales', (req, res) => {

    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, null).execute('sp_CentroCuidoSelect').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * DESHABILITAR SUCURSAL
 */
app.get('/sucursales/deshabilitar/:id', (req, res) => {
    const idSucursal = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, idSucursal).execute('sp_CentroCuidoDelete').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * HABILITAR SUCURSAL
 */
app.get('/sucursales/habilitar/:id', (req, res) => {
    const idSucursal = req.params.id;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, idSucursal).execute('sp_HabilitarCentroCuido').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * CREAR SUCURSAL
 */
app.post('/sucursales', (req, res) => {
    const nombre = req.body.nombre;
    const dir = req.body.direccion;
    const request = new sql.Request(pool);
    let result = request.input('Descripcion', sql.VarChar, nombre).input('Ubicacion', sql.VarChar, dir).input('habilitado', sql.Bit, 0).execute('sp_CentroCuidoInsert').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));

})

/**
 * MODIFICAR SUCURSAL
 */
app.put('/sucursales/:id', (req, res) => {
    const idSucursal = req.params.id;
    const nombre = req.body.nombre;
    const dir = req.body.direccion;
    const estado = req.body.estado;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, idSucursal).input('Descripcion', sql.VarChar, nombre).input('Ubicacion', sql.VarChar, dir).input('habilitado', sql.Bit, estado).execute('sp_CentroCuidoUpdate').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
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
    const { nombre, puesto, email, password, sucursal, direccion } = req.body;
    res.send(`Se deshabilitó el empleado ${idEmpleado}`);
})

/**
 * OBTENER CATEGORIAS
 */
app.get('/categorias', (req, res) => {
    poolConnect.then(() => {
        const request = new sql.Request(pool);
        request.query("select * from Categoria", (err, result) => {
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
 * MODIFICAR CATEGORIA
 */
app.put('/categorias/:id', (req, res) => {
    const idCategoria = req.params.id;
    const { nombre, salarioCuidador, precioCliente } = req.body;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, idCategoria).input('nom', sql.VarChar, nombre).input('salarioC', sql.Money, salarioCuidador).input('precioC',sql.Money, precioCliente).execute('sp_CategoriaUpdate').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * CREAR CATEGORIA
 */
app.post('/categorias', (req, res) => {
    const { nombre, salarioCuidador, precioCliente } = req.body;
    const request = new sql.Request(pool);
    let result = request.input('nom', sql.VarChar, nombre).input('salarioC', sql.Money, salarioCuidador).input('precioC',sql.Money, precioCliente).execute('sp_CategoriaInsert').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
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
    let result = request.input('id', sql.Int, id).execute('sp_EnfermedadDelete').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})

/**
 * ACTUALIZAR ENFERMEDAD ESPECÍFICA
 */
app.put('/enfermedad/:id', (req, res) => {
    const id = req.params.id;
    const descrip = req.body.descripcion;
    const request = new sql.Request(pool);
    let result = request.input('id', sql.Int, id).input('Descripcion', sql.VarChar, descrip).execute('sp_EnfermedadUpdate').then((resu, err) => {
        res.send(resu.recordset)
    }).catch(err => console.log(err));
})


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Escuchando en puerto ${PORT} ...`) })