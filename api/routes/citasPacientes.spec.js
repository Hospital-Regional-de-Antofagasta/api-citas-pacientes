const app = require('../index')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const supertest = require("supertest")
const citasPacientesSeeds = require('../testSeeds/citasPacientesSeeds.json')

const CitasPacientes = require('../models/CitasPacientes')

const request = supertest(app)
const secreto = process.env.JWT_SECRET
let token


beforeAll(async done =>{
    //Cerrar la conexión que se crea en el index.
    await mongoose.disconnect();
    //Conectar a la base de datos de prueba.
    await mongoose.connect(`${process.env.MONGO_URI_TEST}citas_pacientes_test`, { useNewUrlParser: true, useUnifiedTopology: true })
     //Cargar los seeds a la base de datos.
     for (const citaPacienteSeed of citasPacientesSeeds) {
        await Promise.all([
            CitasPacientes.create(citaPacienteSeed),
        ])
    }
    //Cambiar fechas de las citas 13, 14, 17 y 18 del seeder para que sean del día actual.
    const fechaHoy = new Date()
    const fechaHoy1 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),8,30,0,0)
    const fechaHoy2 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),16,30,0,0)
    await Promise.all([
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 13},{FechaCitacion: fechaHoy1}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 14},{FechaCitacion: fechaHoy2}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 17},{FechaCitacion: fechaHoy1}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 18},{FechaCitacion: fechaHoy2})
    ])
    //Cambiar fechas de las citas 19, 20, 21 y 24 del seeder para que sean posteriores al día actual.
    const anio = fechaHoy.getFullYear()+1
    const fechaPosterior1 =  new Date(anio,1,1,8,30,0,0)
    const fechaPosterior2 =  new Date(anio,2,1,16,30,0,0)
    await Promise.all([
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 19},{FechaCitacion: fechaPosterior1}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 20},{FechaCitacion: fechaPosterior1}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 21},{FechaCitacion: fechaPosterior2}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 24},{FechaCitacion: fechaPosterior2})
    ])
    done()
})


afterAll(async (done) => {
    //Borrar el contenido de la colección en la base de datos despues de la pruebas.
    await CitasPacientes.deleteMany()
    //Cerrar la conexión a la base de datos despues de la pruebas.
    await mongoose.connection.close()
    done()
})


describe('Endpoints', () => {
    describe('Horas Médicas Históricas', () => {
        it('Intenta obtener las horas médicas históricas de un paciente sin token', async done =>{ 
            const respuesta = await request.get('/citas_pacientes/horas_medicas/historico')
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas médicas históricas de un paciente con token (Arreglo sin horas médicas)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get('/citas_pacientes/horas_medicas/historico')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo está vacío.
            const arregloHorasMedicas=respuesta.body
            expect(arregloHorasMedicas).toStrictEqual([])
            expect(arregloHorasMedicas.length).toStrictEqual(0)
            done()
        })
        it('Intenta obtener las horas médicas históricas de un paciente con token (Arreglo con horas médicas)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 1}, secreto)
            const respuesta = await request.get('/citas_pacientes/horas_medicas/historico')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
            const arregloHoras = respuesta.body

            const primeraHora = arregloHoras[0]
            const numeroPacientePrimeraHora = primeraHora.NumeroPaciente
            const correlativoPrimeraHora = primeraHora.CorrelativoCita
            const ambitoPrimeraHora = primeraHora.CodigoAmbito

            const segundaHora = arregloHoras[1]
            const numeroPacienteSegundaHora = segundaHora.NumeroPaciente
            const correlativoSegundaHora = segundaHora.CorrelativoCita
            const ambitoSegundaHora = segundaHora.CodigoAmbito

            const terceraHora = arregloHoras[2]
            const numeroPacienteTerceraHora = terceraHora.NumeroPaciente           
            const correlativoTerceraHora = terceraHora.CorrelativoCita
            const ambitoTerceraHora = terceraHora.CodigoAmbito

            const cuartaHora = arregloHoras[3]
            const numeroPacienteCuartaHora = cuartaHora.NumeroPaciente
            const correlativoCuartaHora = cuartaHora.CorrelativoCita
            const ambitoCuartaHora = cuartaHora.CodigoAmbito

            const quintaHora = arregloHoras[4]
            const numeroPacienteQuintaHora = quintaHora.NumeroPaciente
            const correlativoQuintaHora = quintaHora.CorrelativoCita
            const ambitoQuintaHora = quintaHora.CodigoAmbito

            expect(arregloHoras.length).toStrictEqual(5)

            expect(numeroPacientePrimeraHora).toStrictEqual(1)
            expect(correlativoPrimeraHora).toStrictEqual(12)
            expect(ambitoPrimeraHora).toStrictEqual('01')

            expect(numeroPacienteSegundaHora).toStrictEqual(1)
            expect(correlativoSegundaHora).toStrictEqual(17)
            expect(ambitoSegundaHora).toStrictEqual('01')

            expect(numeroPacienteTerceraHora).toStrictEqual(1)
            expect(correlativoTerceraHora).toStrictEqual(18)
            expect(ambitoTerceraHora).toStrictEqual('01')

            expect(numeroPacienteCuartaHora).toStrictEqual(1)
            expect(correlativoCuartaHora).toStrictEqual(19)
            expect(ambitoCuartaHora).toStrictEqual('01')

            expect(numeroPacienteQuintaHora).toStrictEqual(1)
            expect(correlativoQuintaHora).toStrictEqual(24)
            expect(ambitoQuintaHora).toStrictEqual('01')
            done()
        })
    })

    describe('Horas Médicas Proximas', () => {
        it('Intenta obtener las horas médicas posteriores a hoy de un paciente sin token', async done =>{
            const respuesta = await request.get(`/citas_pacientes/horas_medicas/proximas/${encodeURIComponent('America/Santiago')}`)
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo sin horas médicas)', async done =>{
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get(`/citas_pacientes/horas_medicas/proximas/${encodeURIComponent('America/Santiago')}`)
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo está vacío.
            const arregloHorasMedicas=respuesta.body
            expect(arregloHorasMedicas).toStrictEqual([[],[]])
            expect(arregloHorasMedicas.length).toStrictEqual(2)
            expect(arregloHorasMedicas[0].length).toStrictEqual(0)
            expect(arregloHorasMedicas[1].length).toStrictEqual(0)
            done()
        })
        it('Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo con horas médicas)', async done =>{
            token = jwt.sign({PAC_PAC_Numero: 1}, secreto)
            const respuesta = await request.get(`/citas_pacientes/horas_medicas/proximas/${encodeURIComponent('America/Santiago')}`)
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
            const arregloDeArreglosHoras = respuesta.body

            const arregloHorasHoy = arregloDeArreglosHoras[0]

            const primeraHora = arregloHorasHoy[0]
            const numeroPacientePrimeraHora = primeraHora.NumeroPaciente
            const correlativoPrimeraHora = primeraHora.CorrelativoCita
            const ambitoPrimeraHora = primeraHora.CodigoAmbito

            const segundaHora = arregloHorasHoy[1]
            const numeroPacienteSegundaHora = segundaHora.NumeroPaciente
            const correlativoSegundaHora = segundaHora.CorrelativoCita
            const ambitoSegundaHora = segundaHora.CodigoAmbito

            expect(arregloHorasHoy.length).toStrictEqual(2)

            expect(numeroPacientePrimeraHora).toStrictEqual(1)
            expect(correlativoPrimeraHora).toStrictEqual(17)
            expect(ambitoPrimeraHora).toStrictEqual('01')

            expect(numeroPacienteSegundaHora).toStrictEqual(1)
            expect(correlativoSegundaHora).toStrictEqual(18)
            expect(ambitoSegundaHora).toStrictEqual('01')

            const arregloHorasProximas = arregloDeArreglosHoras[1]

            const terceraHora = arregloHorasProximas[0]
            const numeroPacienteTerceraHora = terceraHora.NumeroPaciente
            const correlativoTerceraHora = terceraHora.CorrelativoCita
            const ambitoTerceraHora = terceraHora.CodigoAmbito

            const cuartaHora = arregloHorasProximas[1]
            const numeroPacienteCuartaHora = cuartaHora.NumeroPaciente
            const correlativoCuartaHora = cuartaHora.CorrelativoCita
            const ambitoCuartaHora = cuartaHora.CodigoAmbito
            expect(arregloHorasProximas.length).toStrictEqual(2)

            expect(numeroPacienteTerceraHora).toStrictEqual(1)
            expect(correlativoTerceraHora).toStrictEqual(19)
            expect(ambitoTerceraHora).toStrictEqual('01')

            expect(numeroPacienteCuartaHora).toStrictEqual(1)
            expect(correlativoCuartaHora).toStrictEqual(24)
            expect(ambitoCuartaHora).toStrictEqual('01')
            done()
        })
    })

    describe('Horas Exámenes Históricas', () => {
        it('Intenta obtener las horas de exámenes históricas de un paciente sin token', async done =>{ 
            const respuesta = await request.get('/citas_pacientes/horas_examenes/historico')
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo sin horas de exámenes)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get('/citas_pacientes/horas_examenes/historico')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo está vacío.
            const arregloHorasMedicas=respuesta.body
            expect(arregloHorasMedicas).toStrictEqual([])
            expect(arregloHorasMedicas.length).toStrictEqual(0)
            done()
        })
        it('Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo con horas de exámenes)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 1}, secreto)
            const respuesta = await request.get('/citas_pacientes/horas_examenes/historico')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
            const arregloHoras = respuesta.body

            const primeraHora = arregloHoras[0]
            const numeroPacientePrimeraHora = primeraHora.NumeroPaciente
            const correlativoPrimeraHora = primeraHora.CorrelativoCita
            const ambitoPrimeraHora = primeraHora.CodigoAmbito

            const segundaHora = arregloHoras[1]
            const numeroPacienteSegundaHora = segundaHora.NumeroPaciente
            const correlativoSegundaHora = segundaHora.CorrelativoCita
            const ambitoSegundaHora= segundaHora.CodigoAmbito

            const terceraHora = arregloHoras[2]
            const numeroPacienteTerceraHora = terceraHora.NumeroPaciente           
            const correlativoTerceraHora = terceraHora.CorrelativoCita
            const ambitoTerceraHora = terceraHora.CodigoAmbito

            const cuartaHora = arregloHoras[3]
            const numeroPacienteCuartaHora = cuartaHora.NumeroPaciente
            const correlativoCuartaHora = cuartaHora.CorrelativoCita
            const ambitoCuartaHora = cuartaHora.CodigoAmbito

            expect(arregloHoras.length).toStrictEqual(4)

            expect(numeroPacientePrimeraHora).toStrictEqual(1)
            expect(correlativoPrimeraHora).toStrictEqual(13)
            expect(ambitoPrimeraHora).toStrictEqual('04')

            expect(numeroPacienteSegundaHora).toStrictEqual(1)
            expect(correlativoSegundaHora).toStrictEqual(14)
            expect(ambitoSegundaHora).toStrictEqual('06')

            expect(numeroPacienteTerceraHora).toStrictEqual(1)
            expect(correlativoTerceraHora).toStrictEqual(20)
            expect(ambitoTerceraHora).toStrictEqual('06')

            expect(numeroPacienteCuartaHora).toStrictEqual(1)
            expect(correlativoCuartaHora).toStrictEqual(21)
            expect(ambitoCuartaHora).toStrictEqual('04')
            done()
        })
    })

    describe('Horas Exámenes  Proximas', () => {
        it('Intenta obtener las horas de exámenes posteriores a hoy de un paciente sin token', async done =>{
            const respuesta = await request.get(`/citas_pacientes/horas_examenes/proximas/${encodeURIComponent('America/Santiago')}`)
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)', async done =>{
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get(`/citas_pacientes/horas_examenes/proximas/${encodeURIComponent('America/Santiago')}`)
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo está vacío.
            const arregloHorasMedicas=respuesta.body
            expect(arregloHorasMedicas).toStrictEqual([[],[]])
            expect(arregloHorasMedicas.length).toStrictEqual(2)
            expect(arregloHorasMedicas[0].length).toStrictEqual(0)
            expect(arregloHorasMedicas[1].length).toStrictEqual(0)
            done()
        })
        it('Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo con horas de exámenes)', async done =>{
            token = jwt.sign({PAC_PAC_Numero: 1}, secreto)
            const respuesta = await request.get(`/citas_pacientes/horas_examenes/proximas/${encodeURIComponent('America/Santiago')}`)
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
            const arregloDeArreglosHoras = respuesta.body

            const arregloHorasHoy = arregloDeArreglosHoras[0]

            const primeraHora = arregloHorasHoy[0]
            const numeroPacientePrimeraHora = primeraHora.NumeroPaciente
            const correlativoPrimeraHora = primeraHora.CorrelativoCita
            const ambitoPrimeraHora = primeraHora.CodigoAmbito

            const segundaHora = arregloHorasHoy[1]
            const numeroPacienteSegundaHora = segundaHora.NumeroPaciente
            const correlativoSegundaHora = segundaHora.CorrelativoCita
            const ambitoSegundaHora = segundaHora.CodigoAmbito

            expect(arregloHorasHoy.length).toStrictEqual(2)

            expect(numeroPacientePrimeraHora).toStrictEqual(1)
            expect(correlativoPrimeraHora).toStrictEqual(13)
            expect(ambitoPrimeraHora).toStrictEqual('04')

            expect(numeroPacienteSegundaHora).toStrictEqual(1)
            expect(correlativoSegundaHora).toStrictEqual(14)
            expect(ambitoSegundaHora).toStrictEqual('06')

            const arregloHorasProximas = arregloDeArreglosHoras[1]

            const terceraHora = arregloHorasProximas[0]
            const numeroPacienteTerceraHora = terceraHora.NumeroPaciente
            const correlativoTerceraHora = terceraHora.CorrelativoCita
            const ambitoTerceraHora = terceraHora.CodigoAmbito

            const cuartaHora = arregloHorasProximas[1]
            const numeroPacienteCuartaHora = cuartaHora.NumeroPaciente
            const correlativoCuartaHora = cuartaHora.CorrelativoCita
            const ambitoCuartaHora = cuartaHora.CodigoAmbito
            expect(arregloHorasProximas.length).toStrictEqual(2)

            expect(numeroPacienteTerceraHora).toStrictEqual(1)
            expect(correlativoTerceraHora).toStrictEqual(20)
            expect(ambitoTerceraHora).toStrictEqual('06')

            expect(numeroPacienteCuartaHora).toStrictEqual(1)
            expect(correlativoCuartaHora).toStrictEqual(21)
            expect(ambitoCuartaHora).toStrictEqual('04')
            done()
        })
    })
})