const app = require("../api/index");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const citasPacientesSeeds = require("../api/testSeeds/citasPacientesSeeds.json");

const CitasPacientes = require("../api/models/CitasPacientes");

const request = supertest(app);
const secreto = process.env.JWT_SECRET;
let token;

beforeAll(async (done) => {
  //Cerrar la conexión que se crea en el index.
  await mongoose.disconnect();
  //Conectar a la base de datos de prueba.
  await mongoose.connect(`${process.env.MONGO_URI_TEST}citas_pacientes_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  //Cargar los seeds a la base de datos.
  for (const citaPacienteSeed of citasPacientesSeeds) {
    if(citaPacienteSeed.correlativoCita < 25)
      await Promise.all([CitasPacientes.create(citaPacienteSeed)]);
  }
  //Cambiar fechas de las citas 13, 14, 17 y 18 del seeder para que sean del día actual.
  const fechaHoy = new Date();
  const fechaHoy1 = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate(),
    8,
    30,
    0,
    0
  );
  const fechaHoy2 = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate(),
    16,
    30,
    0,
    0
  );
  await Promise.all([
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 13 },
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 14 },
      { fechaCitacion: fechaHoy2 }
    ),
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 17 },
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 18 },
      { fechaCitacion: fechaHoy2 }
    ),
  ]);
  //Cambiar fechas de las citas 19, 20, 21 y 24 del seeder para que sean posteriores al día actual.
  const anio = fechaHoy.getFullYear() + 1;
  const fechaPosterior1 = new Date(anio, 1, 1, 8, 30, 0, 0);
  const fechaPosterior2 = new Date(anio, 2, 1, 16, 30, 0, 0);
  await Promise.all([
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 19 },
      { fechaCitacion: fechaPosterior1 }
    ),
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 20 },
      { fechaCitacion: fechaPosterior1 }
    ),
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 21 },
      { fechaCitacion: fechaPosterior2 }
    ),
    CitasPacientes.findOneAndUpdate(
      { correlativoCita: 24 },
      { fechaCitacion: fechaPosterior2 }
    ),
  ]);
  done();
});

afterAll(async (done) => {
  //Borrar el contenido de la colección en la base de datos despues de la pruebas.
  await CitasPacientes.deleteMany();
  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();
  done();
});

describe("Endpoints", () => {
  describe("Horas Médicas Históricas", () => {
    it("Intenta obtener las horas médicas históricas de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas_pacientes/horas_medicas/historico"
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas médicas históricas de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/horas_medicas/historico")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo está vacío.
      const arregloHorasMedicas = respuesta.body;
      expect(arregloHorasMedicas).toStrictEqual([]);
      expect(arregloHorasMedicas.length).toStrictEqual(0);
      done();
    });
    it("Intenta obtener las horas médicas históricas de un paciente con token (Arreglo con horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/horas_medicas/historico")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
      const arregloHoras = respuesta.body;

      const primeraHora = arregloHoras[0];
      const numeroPacientePrimeraHora = primeraHora.numeroPaciente;
      const correlativoPrimeraHora = primeraHora.correlativoCita;
      const ambitoPrimeraHora = primeraHora.codigoAmbito;

      const segundaHora = arregloHoras[1];
      const numeroPacienteSegundaHora = segundaHora.numeroPaciente;
      const correlativoSegundaHora = segundaHora.correlativoCita;
      const ambitoSegundaHora = segundaHora.codigoAmbito;

      const terceraHora = arregloHoras[2];
      const numeroPacienteTerceraHora = terceraHora.numeroPaciente;
      const correlativoTerceraHora = terceraHora.correlativoCita;
      const ambitoTerceraHora = terceraHora.codigoAmbito;

      const cuartaHora = arregloHoras[3];
      const numeroPacienteCuartaHora = cuartaHora.numeroPaciente;
      const correlativoCuartaHora = cuartaHora.correlativoCita;
      const ambitoCuartaHora = cuartaHora.codigoAmbito;

      const quintaHora = arregloHoras[4];
      const numeroPacienteQuintaHora = quintaHora.numeroPaciente;
      const correlativoQuintaHora = quintaHora.correlativoCita;
      const ambitoQuintaHora = quintaHora.codigoAmbito;

      expect(arregloHoras.length).toStrictEqual(5);

      expect(numeroPacientePrimeraHora).toStrictEqual(1);
      expect(correlativoPrimeraHora).toStrictEqual(12);
      expect(ambitoPrimeraHora).toStrictEqual("01");

      expect(numeroPacienteSegundaHora).toStrictEqual(1);
      expect(correlativoSegundaHora).toStrictEqual(17);
      expect(ambitoSegundaHora).toStrictEqual("01");

      expect(numeroPacienteTerceraHora).toStrictEqual(1);
      expect(correlativoTerceraHora).toStrictEqual(18);
      expect(ambitoTerceraHora).toStrictEqual("01");

      expect(numeroPacienteCuartaHora).toStrictEqual(1);
      expect(correlativoCuartaHora).toStrictEqual(19);
      expect(ambitoCuartaHora).toStrictEqual("01");

      expect(numeroPacienteQuintaHora).toStrictEqual(1);
      expect(correlativoQuintaHora).toStrictEqual(24);
      expect(ambitoQuintaHora).toStrictEqual("01");
      done();
    });
  });

  describe("Horas Médicas Proximas", () => {
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas_pacientes/horas_medicas/proximas/${encodeURIComponent(
          "America/Santiago"
        )}`
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/horas_medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo está vacío.
      const arregloHorasMedicas = respuesta.body;
      expect(arregloHorasMedicas).toStrictEqual([[], []]);
      expect(arregloHorasMedicas.length).toStrictEqual(2);
      expect(arregloHorasMedicas[0].length).toStrictEqual(0);
      expect(arregloHorasMedicas[1].length).toStrictEqual(0);
      done();
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo con horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/horas_medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
      const arregloDeArreglosHoras = respuesta.body;

      const arregloHorasHoy = arregloDeArreglosHoras[0];

      const primeraHora = arregloHorasHoy[0];
      const numeroPacientePrimeraHora = primeraHora.numeroPaciente;
      const correlativoPrimeraHora = primeraHora.correlativoCita;
      const ambitoPrimeraHora = primeraHora.codigoAmbito;

      const segundaHora = arregloHorasHoy[1];
      const numeroPacienteSegundaHora = segundaHora.numeroPaciente;
      const correlativoSegundaHora = segundaHora.correlativoCita;
      const ambitoSegundaHora = segundaHora.codigoAmbito;

      expect(arregloHorasHoy.length).toStrictEqual(2);

      expect(numeroPacientePrimeraHora).toStrictEqual(1);
      expect(correlativoPrimeraHora).toStrictEqual(17);
      expect(ambitoPrimeraHora).toStrictEqual("01");

      expect(numeroPacienteSegundaHora).toStrictEqual(1);
      expect(correlativoSegundaHora).toStrictEqual(18);
      expect(ambitoSegundaHora).toStrictEqual("01");

      const arregloHorasProximas = arregloDeArreglosHoras[1];

      const terceraHora = arregloHorasProximas[0];
      const numeroPacienteTerceraHora = terceraHora.numeroPaciente;
      const correlativoTerceraHora = terceraHora.correlativoCita;
      const ambitoTerceraHora = terceraHora.codigoAmbito;

      const cuartaHora = arregloHorasProximas[1];
      const numeroPacienteCuartaHora = cuartaHora.numeroPaciente;
      const correlativoCuartaHora = cuartaHora.correlativoCita;
      const ambitoCuartaHora = cuartaHora.codigoAmbito;
      expect(arregloHorasProximas.length).toStrictEqual(2);

      expect(numeroPacienteTerceraHora).toStrictEqual(1);
      expect(correlativoTerceraHora).toStrictEqual(19);
      expect(ambitoTerceraHora).toStrictEqual("01");

      expect(numeroPacienteCuartaHora).toStrictEqual(1);
      expect(correlativoCuartaHora).toStrictEqual(24);
      expect(ambitoCuartaHora).toStrictEqual("01");
      done();
    });
  });

  describe("Horas Exámenes Históricas", () => {
    it("Intenta obtener las horas de exámenes históricas de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas_pacientes/horas_examenes/historico"
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/horas_examenes/historico")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo está vacío.
      const arregloHorasMedicas = respuesta.body;
      expect(arregloHorasMedicas).toStrictEqual([]);
      expect(arregloHorasMedicas.length).toStrictEqual(0);
      done();
    });
    it("Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo con horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/horas_examenes/historico")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
      const arregloHoras = respuesta.body;

      const primeraHora = arregloHoras[0];
      const numeroPacientePrimeraHora = primeraHora.numeroPaciente;
      const correlativoPrimeraHora = primeraHora.correlativoCita;
      const ambitoPrimeraHora = primeraHora.codigoAmbito;

      const segundaHora = arregloHoras[1];
      const numeroPacienteSegundaHora = segundaHora.numeroPaciente;
      const correlativoSegundaHora = segundaHora.correlativoCita;
      const ambitoSegundaHora = segundaHora.codigoAmbito;

      const terceraHora = arregloHoras[2];
      const numeroPacienteTerceraHora = terceraHora.numeroPaciente;
      const correlativoTerceraHora = terceraHora.correlativoCita;
      const ambitoTerceraHora = terceraHora.codigoAmbito;

      const cuartaHora = arregloHoras[3];
      const numeroPacienteCuartaHora = cuartaHora.numeroPaciente;
      const correlativoCuartaHora = cuartaHora.correlativoCita;
      const ambitoCuartaHora = cuartaHora.codigoAmbito;

      expect(arregloHoras.length).toStrictEqual(4);

      expect(numeroPacientePrimeraHora).toStrictEqual(1);
      expect(correlativoPrimeraHora).toStrictEqual(13);
      expect(ambitoPrimeraHora).toStrictEqual("04");

      expect(numeroPacienteSegundaHora).toStrictEqual(1);
      expect(correlativoSegundaHora).toStrictEqual(14);
      expect(ambitoSegundaHora).toStrictEqual("06");

      expect(numeroPacienteTerceraHora).toStrictEqual(1);
      expect(correlativoTerceraHora).toStrictEqual(20);
      expect(ambitoTerceraHora).toStrictEqual("06");

      expect(numeroPacienteCuartaHora).toStrictEqual(1);
      expect(correlativoCuartaHora).toStrictEqual(21);
      expect(ambitoCuartaHora).toStrictEqual("04");
      done();
    });
  });

  describe("Horas Exámenes  Proximas", () => {
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas_pacientes/horas_examenes/proximas/${encodeURIComponent(
          "America/Santiago"
        )}`
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/horas_examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo está vacío.
      const arregloHorasMedicas = respuesta.body;
      expect(arregloHorasMedicas).toStrictEqual([[], []]);
      expect(arregloHorasMedicas.length).toStrictEqual(2);
      expect(arregloHorasMedicas[0].length).toStrictEqual(0);
      expect(arregloHorasMedicas[1].length).toStrictEqual(0);
      done();
    });
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo con horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/horas_examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
      const arregloDeArreglosHoras = respuesta.body;

      const arregloHorasHoy = arregloDeArreglosHoras[0];

      const primeraHora = arregloHorasHoy[0];
      const numeroPacientePrimeraHora = primeraHora.numeroPaciente;
      const correlativoPrimeraHora = primeraHora.correlativoCita;
      const ambitoPrimeraHora = primeraHora.codigoAmbito;

      const segundaHora = arregloHorasHoy[1];
      const numeroPacienteSegundaHora = segundaHora.numeroPaciente;
      const correlativoSegundaHora = segundaHora.correlativoCita;
      const ambitoSegundaHora = segundaHora.codigoAmbito;

      expect(arregloHorasHoy.length).toStrictEqual(2);

      expect(numeroPacientePrimeraHora).toStrictEqual(1);
      expect(correlativoPrimeraHora).toStrictEqual(13);
      expect(ambitoPrimeraHora).toStrictEqual("04");

      expect(numeroPacienteSegundaHora).toStrictEqual(1);
      expect(correlativoSegundaHora).toStrictEqual(14);
      expect(ambitoSegundaHora).toStrictEqual("06");

      const arregloHorasProximas = arregloDeArreglosHoras[1];

      const terceraHora = arregloHorasProximas[0];
      const numeroPacienteTerceraHora = terceraHora.numeroPaciente;
      const correlativoTerceraHora = terceraHora.correlativoCita;
      const ambitoTerceraHora = terceraHora.codigoAmbito;

      const cuartaHora = arregloHorasProximas[1];
      const numeroPacienteCuartaHora = cuartaHora.numeroPaciente;
      const correlativoCuartaHora = cuartaHora.correlativoCita;
      const ambitoCuartaHora = cuartaHora.codigoAmbito;
      expect(arregloHorasProximas.length).toStrictEqual(2);

      expect(numeroPacienteTerceraHora).toStrictEqual(1);
      expect(correlativoTerceraHora).toStrictEqual(20);
      expect(ambitoTerceraHora).toStrictEqual("06");

      expect(numeroPacienteCuartaHora).toStrictEqual(1);
      expect(correlativoCuartaHora).toStrictEqual(21);
      expect(ambitoCuartaHora).toStrictEqual("04");
      done();
    });
  });
});
