const app = require('../index')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const supertest = require("supertest")
const horasMedicasSeeds = require('../testSeeds/horasMedicasSeeds.json')

const HorasMedicas = require('../models/HorasMedicas')

const request = supertest(app)
const secreto = process.env.JWT_SECRET
let token


beforeAll(async done =>{
    //Cerrar la conexión que se crea en el index.
    await mongoose.disconnect();
    //Conectar a la base de datos de prueba.
    await mongoose.connect(`${process.env.MONGO_URI_TEST}horas_medicas_test`, { useNewUrlParser: true, useUnifiedTopology: true })
     //Cargar los seeds a la base de datos.
     for (const horaMedicaSeed of horasMedicasSeeds) {
        await Promise.all([
            HorasMedicas.create(horaMedicaSeed),
        ])
    }
    //Cambiar fechas de las horas 17 y 18 del seeder para que sean del día actual.
    const fechaHoy = new Date()
    const fechaNueva17 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),8,30,0,0)
    const fechaNueva18 =  new Date(fechaHoy.getFullYear(),fechaHoy.getMonth(),fechaHoy.getDate(),16,30,0,0)
    await Promise.all([
        HorasMedicas.findOneAndUpdate({CorrelativoHora: 17},{FechaCitacion: fechaNueva17}),
        HorasMedicas.findOneAndUpdate({CorrelativoHora: 18},{FechaCitacion: fechaNueva18})
    ])
    //Cambiar fechas de las horas 19 y 24 del seeder para que sean posteriores al día actual.
    const anio = fechaHoy.getFullYear()+1
    const fechaNueva19 =  new Date(anio,1,1,8,30,0,0)
    const fechaNueva24 =  new Date(anio,2,1,16,30,0,0)
    await Promise.all([
        HorasMedicas.findOneAndUpdate({CorrelativoHora: 19},{FechaCitacion: fechaNueva19}),
        HorasMedicas.findOneAndUpdate({CorrelativoHora: 24},{FechaCitacion: fechaNueva24}) 
    ])
    done()
})


afterAll(async (done) => {
    //Borrar el contenido de la colección en la base de datos despues de la pruebas.
    await HorasMedicas.deleteMany()
    //Cerrar la conexión a la base de datos despues de la pruebas.
    await mongoose.connection.close()
    done()
})


describe('Endpoints', () => {
    describe('Horas Médicas Históricas', () => {
        it('Intenta obtener las horas médicas históricas de un paciente sin token', async done =>{ 
            const respuesta = await request.get('/horas_medicas/paciente_historico')
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas médicas históricas de un paciente con token (Arreglo sin horas médicas)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get('/horas_medicas/paciente_historico')
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
            const respuesta = await request.get('/horas_medicas/paciente_historico')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
            const arregloHorasMedicas = respuesta.body

            const primeraHoraMedica = arregloHorasMedicas[0]
            const numeroPacientePrimeraHoraMedica = primeraHoraMedica.NumeroPaciente
            const correlativoPrimeraHoraMedica = primeraHoraMedica.CorrelativoHora

            const segundaHoraMedica = arregloHorasMedicas[1]
            const numeroPacienteSegundaHoraMedica = segundaHoraMedica.NumeroPaciente
            const correlativoSegundaHoraMedica = segundaHoraMedica.CorrelativoHora

            const terceraHoraMedica = arregloHorasMedicas[2]
            const numeroPacienteTerceraHoraMedica = terceraHoraMedica.NumeroPaciente           
            const correlativoTerceraHoraMedica = terceraHoraMedica.CorrelativoHora

            const cuartaHoraMedica = arregloHorasMedicas[3]
            const numeroPacienteCuartaHoraMedica = cuartaHoraMedica.NumeroPaciente
            const correlativoCuartaHoraMedica = cuartaHoraMedica.CorrelativoHora

            const quintaHoraMedica = arregloHorasMedicas[4]
            const numeroPacienteQuintaHoraMedica = quintaHoraMedica.NumeroPaciente
            const correlativoQuintaHoraMedica = quintaHoraMedica.CorrelativoHora

            expect(arregloHorasMedicas.length).toStrictEqual(5)

            expect(numeroPacientePrimeraHoraMedica).toStrictEqual(1)
            expect(correlativoPrimeraHoraMedica).toStrictEqual(12)

            expect(numeroPacienteSegundaHoraMedica).toStrictEqual(1)
            expect(correlativoSegundaHoraMedica).toStrictEqual(17)

            expect(numeroPacienteTerceraHoraMedica).toStrictEqual(1)
            expect(correlativoTerceraHoraMedica).toStrictEqual(18)

            expect(numeroPacienteCuartaHoraMedica).toStrictEqual(1)
            expect(correlativoCuartaHoraMedica).toStrictEqual(19)

            expect(numeroPacienteQuintaHoraMedica).toStrictEqual(1)
            expect(correlativoQuintaHoraMedica).toStrictEqual(24)
            done()
        })
    })

    describe('Horas Médicas Proximas', () => {
        it('Intenta obtener las horas médicas posteriores a hoy de un paciente sin token', async done =>{
            const respuesta = await request.get(`/horas_medicas/paciente_proximas/${encodeURIComponent('America/Santiago')}`)
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo sin horas médicas)', async done =>{
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get(`/horas_medicas/paciente_proximas/${encodeURIComponent('America/Santiago')}`)
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
            const respuesta = await request.get(`/horas_medicas/paciente_proximas/${encodeURIComponent('America/Santiago')}`)
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)
            //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
            const arregloDeArreglosHorasMedicas = respuesta.body

            const arregloHorasMedicasHoy = arregloDeArreglosHorasMedicas[0]

            const primeraHoraMedica = arregloHorasMedicasHoy[0]
            const numeroPacientePrimeraHoraMedica = primeraHoraMedica.NumeroPaciente
            const correlativoPrimeraHoraMedica = primeraHoraMedica.CorrelativoHora

            const segundaHoraMedica = arregloHorasMedicasHoy[1]
            const numeroPacienteSegundaHoraMedica = segundaHoraMedica.NumeroPaciente
            const correlativoSegundaHoraMedica = segundaHoraMedica.CorrelativoHora

            expect(arregloHorasMedicasHoy.length).toStrictEqual(2)

            expect(numeroPacientePrimeraHoraMedica).toStrictEqual(1)
            expect(correlativoPrimeraHoraMedica).toStrictEqual(17)

            expect(numeroPacienteSegundaHoraMedica).toStrictEqual(1)
            expect(correlativoSegundaHoraMedica).toStrictEqual(18)

            const arregloHorasMedicasProximas = arregloDeArreglosHorasMedicas[1]

            const terceraHoraMedica = arregloHorasMedicasProximas[0]
            const numeroPacienteTerceraHoraMedica = terceraHoraMedica.NumeroPaciente
            const correlativoTerceraHoraMedica = terceraHoraMedica.CorrelativoHora

            const cuartaHoraMedica = arregloHorasMedicasProximas[1]
            const numeroPacienteCuartaHoraMedica = cuartaHoraMedica.NumeroPaciente
            const correlativoCuartaHoraMedica = cuartaHoraMedica.CorrelativoHora

            expect(arregloHorasMedicasProximas.length).toStrictEqual(2)

            expect(numeroPacienteTerceraHoraMedica).toStrictEqual(1)
            expect(correlativoTerceraHoraMedica).toStrictEqual(19)

            expect(numeroPacienteCuartaHoraMedica).toStrictEqual(1)
            expect(correlativoCuartaHoraMedica).toStrictEqual(24)
            done()
        })
    })
})