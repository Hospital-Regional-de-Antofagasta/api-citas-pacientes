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
            const respuesta = await request.get('/horas_medicas/horas_medicas_paciente_historico')      
            expect(respuesta.status).toBe(403)
            expect(respuesta.body.respuesta).toBeTruthy()
            done()
        })
        it('Intenta obtener las horas médicas históricas de un paciente con token (Arreglo sin horas médicas)', async done =>{            
            token = jwt.sign({PAC_PAC_Numero: 2}, secreto)
            const respuesta = await request.get('/horas_medicas/horas_medicas_paciente_historico')
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
            const respuesta = await request.get('/horas_medicas/horas_medicas_paciente_historico')
                .set('Authorization',token)
            expect(respuesta.status).toBe(200)  
            //Probar que el arreglo tiene dos horas médicas y que ambas son del mismo paciente.
            const arregloHorasMedicas = respuesta.body
            expect(arregloHorasMedicas.length).toStrictEqual(3)
            const primeraHoraMedica = arregloHorasMedicas[0]
            const numeroPacientePrimeraHoraMedica = primeraHoraMedica.NumeroPaciente
            expect(numeroPacientePrimeraHoraMedica).toStrictEqual(1)
            const segundaHoraMedica = arregloHorasMedicas[1]
            const numeroPacienteSegundaHoraMedica = segundaHoraMedica.NumeroPaciente
            expect(numeroPacienteSegundaHoraMedica).toStrictEqual(1)
            const terceraHoraMedica = arregloHorasMedicas[2]
            const numeroPacienteTerceraHoraMedica = terceraHoraMedica.NumeroPaciente
            expect(numeroPacienteTerceraHoraMedica).toStrictEqual(1)
            done()
        })
        const fecha = new Date().setUTCHours(15)
        console.log(new Date(fecha))
        // const fecha1 = fecha.toLocaleString('en-US', { timeZone: process.env.ZONA_HORARIA })
        // console.log(fecha1)
        // console.log(new Date(fecha1))
        // console.log(new Date(new Date(fecha1).setUTCHours(15)))          
    })
})