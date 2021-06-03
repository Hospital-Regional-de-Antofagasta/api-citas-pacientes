const app = require("../api/index");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const moment = require("moment");
const citasPacientesSeeds = require("../api/testSeeds/citasPacientesSeeds.json");
const diasFeriadosSeeds = require("../api/testSeeds/diasFeriadosSeeds.json");
const solicitudesControlesSeeds = require("../api/testSeeds/solicitudesCambiarOAnularHorasMedicasSeeds.json");
const { cargarFeriados } = require("../api/config");
const CitasPacientes = require("../api/models/CitasPacientes");
const DiasFeriados = require("../api/models/DiasFeriados");
const SolicitudesCambiarOAnularHorasMedicas = require("../api/models/SolicitudesCambiarOAnularHorasMedicas");

const request = supertest(app);
const secreto = process.env.JWT_SECRET;
let token;

beforeAll(async (done) => {
  //Cerrar la conexión que se crea en el index.
  await mongoose.disconnect();

  //Conectar a la base de datos de prueba.
  await mongoose.connect(
    `${process.env.MONGO_URI_TEST}solicitudes_controles_test`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  );

  //Cargar los seeds a la base de datos.
  for (const citaPacienteSeed of citasPacientesSeeds) {
    if(citaPacienteSeed.correlativoCita >= 25)
      await Promise.all([CitasPacientes.create(citaPacienteSeed)]);
  }
  for (const diaFeriadoSeed of diasFeriadosSeeds) {
    await Promise.all([DiasFeriados.create(diaFeriadoSeed)]);
  }
  for (const solicitud of solicitudesControlesSeeds) {
    await Promise.all([
      SolicitudesCambiarOAnularHorasMedicas.create(solicitud),
    ]);
  }

  //Fechas para preparar escenarios de prueba.
  const fechaHoy = new Date();
  const fechaFeriado = new Date(moment(fechaHoy, "DD-MM-YYYY").add(1, "days"));
  const fechaProxima = new Date(moment(fechaHoy, "DD-MM-YYYY").add(3, "days"));
  let diaFeriado = fechaFeriado.getDate();
  let mesFeriado = 1 + fechaFeriado.getMonth(); //date usa los meses de 0 a 11
  if (fechaFeriado.getDate() < 10) diaFeriado = "0" + diaFeriado;
  if (fechaFeriado.getMonth() < 10) mesFeriado = "0" + mesFeriado;
  await Promise.all([
    DiasFeriados.create({
      fecha: fechaFeriado.getFullYear() + "-" + mesFeriado + "-" + diaFeriado,
    }),
  ]);
  cargarFeriados();

  //Cambiar fechas de las citas 25, 26, 27, 28, 29 y 30 del seeder para los escenarios de prueba.
  await Promise.all([
    CitasPacientes.updateOne(
      { correlativoCita: 25 },
      { fechaCitacion: new Date(fechaHoy.getFullYear() - 1, 0, 1, 8, 30, 0, 0) }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 26 },
      { fechaCitacion: new Date(fechaHoy.getFullYear() - 1, 1, 2, 8, 30, 0, 0) }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 27 },
      {
        fechaCitacion: new Date(
          fechaHoy.getFullYear(),
          fechaHoy.getMonth(),
          fechaHoy.getDate(),
          8,
          30,
          0,
          0
        ),
      }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 28 },
      {
        fechaCitacion: new Date(
          fechaProxima.getFullYear(),
          fechaProxima.getMonth(),
          fechaProxima.getDate(),
          8,
          30,
          0,
          0
        ),
      }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 29 },
      { fechaCitacion: new Date(fechaHoy.getFullYear() + 1, 1, 2, 8, 30, 0, 0) }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 30 },
      { fechaCitacion: new Date(fechaHoy.getFullYear() + 1, 2, 2, 8, 30, 0, 0) }
    ),
  ]);
  done();
});

afterAll(async (done) => {
  //Borrar el contenido de la colección en la base de datos despues de la pruebas.
  await CitasPacientes.deleteMany();
  await DiasFeriados.deleteMany();
  await SolicitudesCambiarOAnularHorasMedicas.deleteMany();

  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();
  done();
});

describe("Obtener histórico de solicitudes:", () => {
  // it("Intenta obtener las solicitudes históricas de un paciente sin token", async (done) => {
  //   const respuesta = await request.get(
  //     "/v1/citas_pacientes/historico_solicitudes_citas"
  //   );
  //   expect(respuesta.status).toBe(401);
  //   expect(respuesta.body.respuesta).toBeTruthy();
  //   done();
  // });
  // it("Intenta obtener las solicitudes históricas de un paciente con token (Arreglo sin solicitudes)", async (done) => {
  //   token = jwt.sign({ numeroPaciente: 2 }, secreto);
  //   const respuesta = await request
  //     .get("/v1/citas_pacientes/historico_solicitudes_citas")
  //     .set("Authorization", token);
  //   expect(respuesta.status).toBe(200);
  //   //Probar que el arreglo está vacío.
  //   const arreglosolicitudes = respuesta.body;
  //   expect(arreglosolicitudes).toStrictEqual([]);
  //   expect(arreglosolicitudes.length).toStrictEqual(0);
  //   done();
  // });
  // it("Intenta obtener las solicitudes históricas de un paciente con token (Arreglo con solicitudes)", async (done) => {
  //   token = jwt.sign({ numeroPaciente: 1 }, secreto);
  //   const respuesta = await request
  //     .get("/v1/citas_pacientes/historico_solicitudes_citas")
  //     .set("Authorization", token);
  //   expect(respuesta.status).toBe(200);
  //   //Probar que el arreglo tiene cinco solicitudes y que todas son del mismo paciente.
  //   const arregloSolicitudes = respuesta.body;

  //   const primeraSolicitud = arregloSolicitudes[0];
  //   const numeroPacientePrimeraSolicitud = primeraSolicitud.numeroPaciente;
  //   const correlativoPrimeraSolicitud = primeraSolicitud.correlativoCita;

  //   const segundaSolicitud = arregloSolicitudes[1];
  //   const numeroPacienteSegundaSolicitud = segundaSolicitud.numeroPaciente;
  //   const correlativoSegundaSolicitud = segundaSolicitud.correlativoCita;

  //   const terceraSolicitud = arregloSolicitudes[2];
  //   const numeroPacienteTerceraSolicitud = terceraSolicitud.numeroPaciente;
  //   const correlativoTerceraSolicitud = terceraSolicitud.correlativoCita;

  //   const cuartaSolicitud = arregloSolicitudes[3];
  //   const numeroPacienteCuartaSolicitud = cuartaSolicitud.numeroPaciente;
  //   const correlativoCuartaSolicitud = cuartaSolicitud.correlativoCita;

  //   expect(arregloSolicitudes.length).toStrictEqual(4);

  //   expect(numeroPacientePrimeraSolicitud).toStrictEqual(1);
  //   expect(correlativoPrimeraSolicitud).toStrictEqual(10);

  //   expect(numeroPacienteSegundaSolicitud).toStrictEqual(1);
  //   expect(correlativoSegundaSolicitud).toStrictEqual(9);

  //   expect(numeroPacienteTerceraSolicitud).toStrictEqual(1);
  //   expect(correlativoTerceraSolicitud).toStrictEqual(8);

  //   expect(numeroPacienteCuartaSolicitud).toStrictEqual(1);
  //   expect(correlativoCuartaSolicitud).toStrictEqual(7);
  //   done();
  // });
});

describe("Endpoints Solicitudes Horas Médicas", () => {
  
  describe("Guardar solicitudes:", () => {
    it("Solicitud sin token.", async (done) => {
      const respuesta = await request.post(
        "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    describe("Solicitud con token y datos no válidos:", () => {
      it("Solicitud sin tipoSolicitud.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 25,
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/AGENDAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud ANULAR sin correlativoCita.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          tipoSolicitud: "CAMBIAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud CAMBIAR sin correlativoCita.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          tipoSolicitud: "CAMBIAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
    });
    describe("Guardar solicitudes ANULAR/CAMBIAR con token:", () => {
      it("Solicitud ANULAR control inexistente.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 3,
          tipoSolicitud: "ANULAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud CAMBIAR control inexistente.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 3,
          tipoSolicitud: "CAMBIAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud ANULAR con menos de 3 días hábiles antes del control (hoy).", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 27,
          tipoSolicitud: "ANULAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud ANULAR con menos de 3 días hábiles antes del control (próxima).", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 28,
          tipoSolicitud: "ANULAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud CAMBIAR con menos de 3 días hábiles antes del control (hoy).", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 27,
          tipoSolicitud: "CAMBIAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud CAMBIAR con menos de 3 días hábiles antes del control (próxima).", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 28,
          tipoSolicitud: "CAMBIAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();
        done();
      });
      it("Solicitud CAMBIAR con más de 3 días hábiles antes del control.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 29,
          tipoSolicitud: "CAMBIAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(201);

        //Borrar solicitud
        await SolicitudesCambiarOAnularHorasMedicas.deleteOne({
          correlativoCita: 29,
        });

        done();
      });
      it("Solicitud ANULAR con más de 3 días hábiles antes del control.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          correlativoCita: 30,
          tipoSolicitud: "ANULAR",
        };
        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(201);

        //Borrar solicitud
        await SolicitudesCambiarOAnularHorasMedicas.deleteOne({
          correlativoCita: 30,
        });

        done();
      });
      it("Solicitud ANULAR, que ya fue solicitada previamente.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          numeroPaciente: 1,
          correlativoCita: 30,
          tipoSolicitud: "ANULAR",
        };

        //Crear solicitud
        await SolicitudesCambiarOAnularHorasMedicas.create(body);

        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();

        //Borrar solicitud
        await SolicitudesCambiarOAnularHorasMedicas.deleteOne({
          correlativoCita: 30,
        });

        done();
      });
      it("Solicitud CAMBIAR, que ya fue solicitada previamente.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          numeroPaciente: 1,
          correlativoCita: 29,
          tipoSolicitud: "CAMBIAR",
        };

        //Crear solicitud
        await SolicitudesCambiarOAnularHorasMedicas.create(body);

        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();

        //Borrar solicitud
        await SolicitudesCambiarOAnularHorasMedicas.deleteOne({
          correlativoCita: 29,
        });

        done();
      });
      it("Solicitud CAMBIAR, que ya fue solicitada ANULAR previamente.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          numeroPaciente: 1,
          correlativoCita: 30,
          tipoSolicitud: "ANULAR",
        };

        //Crear solicitud
        await SolicitudesCambiarOAnularHorasMedicas.create(body);

        body.tipoSolicitud = "CAMBIAR";

        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/CAMBIAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();

        //Borrar solicitud
        await SolicitudesCambiarOAnularHorasMedicas.deleteOne({
          correlativoCita: 30,
        });

        done();
      });
      it("Solicitud ANULAR, que ya fue solicitada CAMBIAR previamente.", async (done) => {
        token = jwt.sign({ numeroPaciente: 1 }, secreto);
        let body = {
          numeroPaciente: 1,
          correlativoCita: 29,
          tipoSolicitud: "CAMBIAR",
        };

        //Crear solicitud
        await SolicitudesCambiarOAnularHorasMedicas.create(body);

        body.tipoSolicitud = "ANULAR";

        const respuesta = await request
          .post(
            "/v1/citas_pacientes/guardar_solicitud_anular_cambiar_hora_medica/ANULAR"
          )
          .set("Authorization", token)
          .send(body);
        expect(respuesta.status).toBe(400);
        expect(respuesta.body.respuesta).toBeTruthy();

        //Borrar solicitud
        await SolicitudesCambiarOAnularHorasMedicas.deleteOne({
          correlativoCita: 29,
        });

        done();
      });
    });
  });
});
