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
    //Cambiar fechas de las citas 17 y 18 del seeder para que sean del día actual.
    const fechaHoy = new Date()
    const fechaNueva17 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),8,30,0,0)
    const fechaNueva18 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),16,30,0,0)
    await Promise.all([
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 17},{FechaCitacion: fechaNueva17}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 18},{FechaCitacion: fechaNueva18})
    ])
    //Cambiar fechas de las citas 19 y 24 del seeder para que sean posteriores al día actual.
    const anio = fechaHoy.getFullYear()+1
    const fechaNueva19 =  new Date(anio,1,1,8,30,0,0)
    const fechaNueva24 =  new Date(anio,2,1,16,30,0,0)
    await Promise.all([
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 19},{FechaCitacion: fechaNueva19}),
        CitasPacientes.findOneAndUpdate({CorrelativoCita: 24},{FechaCitacion: fechaNueva24})
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
            const arregloHorasMedicas = respuesta.body

            const primeraHoraMedica = arregloHorasMedicas[0]
            const numeroPacientePrimeraHoraMedica = primeraHoraMedica.NumeroPaciente
            const correlativoPrimeraHoraMedica = primeraHoraMedica.CorrelativoCita
            const ambitoPrimeraHoraMedica = primeraHoraMedica.CodigoAmbito

            const segundaHoraMedica = arregloHorasMedicas[1]
            const numeroPacienteSegundaHoraMedica = segundaHoraMedica.NumeroPaciente
            const correlativoSegundaHoraMedica = segundaHoraMedica.CorrelativoCita
            const ambitoSegundaHoraMedica = segundaHoraMedica.CodigoAmbito

            const terceraHoraMedica = arregloHorasMedicas[2]
            const numeroPacienteTerceraHoraMedica = terceraHoraMedica.NumeroPaciente           
            const correlativoTerceraHoraMedica = terceraHoraMedica.CorrelativoCita
            const ambitoTerceraHoraMedica = terceraHoraMedica.CodigoAmbito

            const cuartaHoraMedica = arregloHorasMedicas[3]
            const numeroPacienteCuartaHoraMedica = cuartaHoraMedica.NumeroPaciente
            const correlativoCuartaHoraMedica = cuartaHoraMedica.CorrelativoCita
            const ambitoCuartaHoraMedica = cuartaHoraMedica.CodigoAmbito

            const quintaHoraMedica = arregloHorasMedicas[4]
            const numeroPacienteQuintaHoraMedica = quintaHoraMedica.NumeroPaciente
            const correlativoQuintaHoraMedica = quintaHoraMedica.CorrelativoCita
            const ambitoQuintaHoraMedica = quintaHoraMedica.CodigoAmbito

            expect(arregloHorasMedicas.length).toStrictEqual(5)

            expect(numeroPacientePrimeraHoraMedica).toStrictEqual(1)
            expect(correlativoPrimeraHoraMedica).toStrictEqual(12)
            expect(ambitoPrimeraHoraMedica).toStrictEqual('1')

            expect(numeroPacienteSegundaHoraMedica).toStrictEqual(1)
            expect(correlativoSegundaHoraMedica).toStrictEqual(17)
            expect(ambitoSegundaHoraMedica).toStrictEqual('1')

            expect(numeroPacienteTerceraHoraMedica).toStrictEqual(1)
            expect(correlativoTerceraHoraMedica).toStrictEqual(18)
            expect(ambitoTerceraHoraMedica).toStrictEqual('1')

            expect(numeroPacienteCuartaHoraMedica).toStrictEqual(1)
            expect(correlativoCuartaHoraMedica).toStrictEqual(19)
            expect(ambitoCuartaHoraMedica).toStrictEqual('1')

            expect(numeroPacienteQuintaHoraMedica).toStrictEqual(1)
            expect(correlativoQuintaHoraMedica).toStrictEqual(24)
            expect(ambitoQuintaHoraMedica).toStrictEqual('1')
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
            const arregloDeArreglosHorasMedicas = respuesta.body

            const arregloHorasMedicasHoy = arregloDeArreglosHorasMedicas[0]

            const primeraHoraMedica = arregloHorasMedicasHoy[0]
            const numeroPacientePrimeraHoraMedica = primeraHoraMedica.NumeroPaciente
            const correlativoPrimeraHoraMedica = primeraHoraMedica.CorrelativoCita
            const ambitoPrimeraHoraMedica = primeraHoraMedica.CodigoAmbito

            const segundaHoraMedica = arregloHorasMedicasHoy[1]
            const numeroPacienteSegundaHoraMedica = segundaHoraMedica.NumeroPaciente
            const correlativoSegundaHoraMedica = segundaHoraMedica.CorrelativoCita
            const ambitoSegundaHoraMedica = segundaHoraMedica.CodigoAmbito

            expect(arregloHorasMedicasHoy.length).toStrictEqual(2)

            expect(numeroPacientePrimeraHoraMedica).toStrictEqual(1)
            expect(correlativoPrimeraHoraMedica).toStrictEqual(17)
            expect(ambitoPrimeraHoraMedica).toStrictEqual('1')

            expect(numeroPacienteSegundaHoraMedica).toStrictEqual(1)
            expect(correlativoSegundaHoraMedica).toStrictEqual(18)
            expect(ambitoSegundaHoraMedica).toStrictEqual('1')

            const arregloHorasMedicasProximas = arregloDeArreglosHorasMedicas[1]

            const terceraHoraMedica = arregloHorasMedicasProximas[0]
            const numeroPacienteTerceraHoraMedica = terceraHoraMedica.NumeroPaciente
            const correlativoTerceraHoraMedica = terceraHoraMedica.CorrelativoCita
            const ambitoTerceraHoraMedica = terceraHoraMedica.CodigoAmbito

            const cuartaHoraMedica = arregloHorasMedicasProximas[1]
            const numeroPacienteCuartaHoraMedica = cuartaHoraMedica.NumeroPaciente
            const correlativoCuartaHoraMedica = cuartaHoraMedica.CorrelativoCita
            const ambitoCuartaHoraMedica = cuartaHoraMedica.CodigoAmbito

            expect(arregloHorasMedicasProximas.length).toStrictEqual(2)

            expect(numeroPacienteTerceraHoraMedica).toStrictEqual(1)
            expect(correlativoTerceraHoraMedica).toStrictEqual(19)
            expect(ambitoTerceraHoraMedica).toStrictEqual('1')

            expect(numeroPacienteCuartaHoraMedica).toStrictEqual(1)
            expect(correlativoCuartaHoraMedica).toStrictEqual(24)
            expect(ambitoCuartaHoraMedica).toStrictEqual('1')
            done()
        })
    })
})