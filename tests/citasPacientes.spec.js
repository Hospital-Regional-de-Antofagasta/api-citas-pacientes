const app = require("../api/index");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const moment = require("moment");
const citasPacientesSeeds = require("../api/testSeeds/citasPacientesSeeds.json");
const diasFeriadosSeeds = require("../api/testSeeds/diasFeriadosSeeds.json");
const { cargarFeriados } = require("../api/config");

const CitasPacientes = require("../models/CitasPacientes"); //SOLO VERSION GRATUITA DE VERCEL
const DiasFeriados = require("../models/DiasFeriados"); //SOLO VERSION GRATUITA DE VERCEL
//const CitasPacientes = require("../api/models/CitasPacientes");
//const DiasFeriados = require("../api/models/DiasFeriados");

const request = supertest(app);
const secreto = process.env.JWT_SECRET;
let token;

beforeAll(async (done) => {
  //Cerrar la conexión que se crea en el index.
  await mongoose.disconnect();
  //Conectar a la base de datos de prueba.
  await mongoose.connect(
    `${process.env.MONGO_URI_TEST}solicitudes_citas_pacientes_test`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );
  //Cargar los seeds a la base de datos.
  await CitasPacientes.create(citasPacientesSeeds);
  await DiasFeriados.create(diasFeriadosSeeds);
  //Fechas para preparar escenarios de prueba.
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
  const fechaHoy3 = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate(),
    18,
    30,
    0,
    0
  );
  const fechaFeriado = new Date(moment(fechaHoy, "DD-MM-YYYY").add(1, "days"));
  const fechaProxima = new Date(moment(fechaHoy, "DD-MM-YYYY").add(2, "days"));
  let diaFeriado = fechaFeriado.getDate();
  let mesFeriado = 1 + fechaFeriado.getMonth(); //Date usa los meses de 0 a 11
  if (fechaFeriado.getDate() < 10) diaFeriado = "0" + diaFeriado;
  if (fechaFeriado.getMonth() < 10) mesFeriado = "0" + mesFeriado;
  await DiasFeriados.create({
    fecha: fechaFeriado.getFullYear() + "-" + mesFeriado + "-" + diaFeriado,
  });
  cargarFeriados();
  const fechaAnterior1 = new Date(
    fechaHoy.getFullYear() - 2,
    0,
    1,
    8,
    30,
    0,
    0
  );
  const fechaAnterior2 = new Date(
    fechaHoy.getFullYear() - 1,
    0,
    1,
    8,
    30,
    0,
    0
  );
  const fechaAnterior3 = new Date(
    fechaHoy.getFullYear() - 1,
    1,
    2,
    8,
    30,
    0,
    0
  );
  const fechaPosterior1 = new Date(
    fechaHoy.getFullYear() + 1,
    1,
    1,
    8,
    30,
    0,
    0
  );
  const fechaPosterior2 = new Date(
    fechaHoy.getFullYear() + 1,
    2,
    1,
    16,
    30,
    0,
    0
  );
  //Cambiar fechas de las citas  del seeder para los diferentes escenarios.
  await Promise.all([
    CitasPacientes.updateOne(
      { correlativoCita: 11 },
      { fechaCitacion: fechaAnterior1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 12 },
      { fechaCitacion: fechaAnterior2 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 13 },
      { fechaCitacion: fechaAnterior3 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 14 },
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 15 },
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 17 },
      { fechaCitacion: fechaHoy2 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 18 },
      { fechaCitacion: fechaHoy2 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 19 },
      { fechaCitacion: fechaHoy3 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 20 },
      { fechaCitacion: fechaProxima }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 21 },
      { fechaCitacion: fechaPosterior1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 24 },
      { fechaCitacion: fechaPosterior1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 25 },
      { fechaCitacion: fechaPosterior1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 26 },
      { fechaCitacion: fechaPosterior2 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 27 },
      { fechaCitacion: fechaPosterior2 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 28 },
      { fechaCitacion: fechaPosterior2 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 29 },
      { fechaCitacion: fechaPosterior2 }
    ),
  ]);
  done();
});

afterAll(async (done) => {
  //Borrar el contenido de la colección en la base de datos despues de la pruebas.
  await CitasPacientes.deleteMany();
  await DiasFeriados.deleteMany();
  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();
  done();
});

describe("Endpoints", () => {
  describe("/v1/citas_pacientes/:correlativoCita", () => {
    it("Intenta obtener una cita sin token", async (done) => {
      const respuesta = await request.get("/v1/citas_pacientes/20");
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener una cita que no existe con token", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/10")
        .set("Authorization", token);
      const cita = respuesta.body;
      expect(respuesta.status).toBe(200);
      expect(cita).toStrictEqual({});
      done();
    });
    it("Intenta obtener una cita con token", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/11")
        .set("Authorization", token);
      const cita = respuesta.body;
      expect(respuesta.status).toBe(200);
      expect(cita.correlativoCita).toStrictEqual(11);
      done();
    });
  });
  describe("/v1/citas_pacientes/tipo/horas_medicas", () => {
    it("Intenta obtener las horas médicas históricas de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas_pacientes/tipo/horas_medicas"
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas médicas históricas de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/tipo/horas_medicas")
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
        .get("/v1/citas_pacientes/tipo/horas_medicas")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 11 horas médicas y que todas son del mismo paciente.
      const arregloHoras = respuesta.body;

      expect(arregloHoras.length).toStrictEqual(12);

      expect(arregloHoras[0].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[0].correlativoCita).toStrictEqual(11);
      expect(arregloHoras[0].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[1].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[1].correlativoCita).toStrictEqual(12);
      expect(arregloHoras[1].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[2].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[2].correlativoCita).toStrictEqual(17);
      expect(arregloHoras[2].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[3].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[3].correlativoCita).toStrictEqual(18);
      expect(arregloHoras[3].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[4].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[4].correlativoCita).toStrictEqual(19);
      expect(arregloHoras[4].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[5].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[5].correlativoCita).toStrictEqual(20);
      expect(arregloHoras[5].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[6].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[6].correlativoCita).toStrictEqual(24);
      expect(arregloHoras[6].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[7].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[7].correlativoCita).toStrictEqual(25);
      expect(arregloHoras[7].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[8].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[8].correlativoCita).toStrictEqual(26);
      expect(arregloHoras[8].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[9].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[9].correlativoCita).toStrictEqual(27);
      expect(arregloHoras[9].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[10].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[10].correlativoCita).toStrictEqual(28);
      expect(arregloHoras[10].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[11].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[11].correlativoCita).toStrictEqual(29);
      expect(arregloHoras[11].codigoAmbito).toStrictEqual("01");
      done();
    });
  });
  describe("/v1/citas_pacientes/tipo/horas_medicas/proximas/:timeZone", () => {
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas_pacientes/tipo/horas_medicas/proximas/${encodeURIComponent(
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
          `/v1/citas_pacientes/tipo/horas_medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
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
          `/v1/citas_pacientes/tipo/horas_medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
      const arregloDeArreglosHoras = respuesta.body;

      const arregloHorasHoy = arregloDeArreglosHoras[0];
      expect(arregloHorasHoy.length).toStrictEqual(3);

      expect(arregloHorasHoy[0].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasHoy[0].correlativoCita).toStrictEqual(17);
      expect(arregloHorasHoy[0].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasHoy[1].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasHoy[1].correlativoCita).toStrictEqual(18);
      expect(arregloHorasHoy[1].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasHoy[2].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasHoy[2].correlativoCita).toStrictEqual(19);
      expect(arregloHorasHoy[2].codigoAmbito).toStrictEqual("01");

      const arregloHorasProximas = arregloDeArreglosHoras[1];
      expect(arregloHorasProximas.length).toStrictEqual(7);

      expect(arregloHorasProximas[0].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[0].correlativoCita).toStrictEqual(20);
      expect(arregloHorasProximas[0].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[1].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[1].correlativoCita).toStrictEqual(24);
      expect(arregloHorasProximas[1].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[2].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[2].correlativoCita).toStrictEqual(25);
      expect(arregloHorasProximas[2].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[3].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[3].correlativoCita).toStrictEqual(26);
      expect(arregloHorasProximas[3].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[4].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[4].correlativoCita).toStrictEqual(27);
      expect(arregloHorasProximas[4].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[5].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[5].correlativoCita).toStrictEqual(28);
      expect(arregloHorasProximas[5].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[6].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[6].correlativoCita).toStrictEqual(29);
      expect(arregloHorasProximas[6].codigoAmbito).toStrictEqual("01");
      done();
    });
  });
  describe("/v1/citas_pacientes/tipo/horas_medicas/historico/:timeZone", () => {
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas_pacientes/tipo/horas_medicas/historico/${encodeURIComponent(
          "America/Santiago"
        )}`
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/tipo/horas_medicas/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      const arregloHorasMedicas = respuesta.body;
      expect(arregloHorasMedicas).toStrictEqual([]);
      expect(arregloHorasMedicas.length).toStrictEqual(0);
      done();
    });
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente con token (Arreglo con horas médicas)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/tipo/horas_medicas/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);

      const arreglosHoras = respuesta.body;

      expect(arreglosHoras.length).toStrictEqual(2);

      expect(arreglosHoras[0].numeroPaciente).toStrictEqual(1);
      expect(arreglosHoras[0].correlativoCita).toStrictEqual(12);
      expect(arreglosHoras[0].codigoAmbito).toStrictEqual("01");

      expect(arreglosHoras[1].numeroPaciente).toStrictEqual(1);
      expect(arreglosHoras[1].correlativoCita).toStrictEqual(11);
      expect(arreglosHoras[1].codigoAmbito).toStrictEqual("01");
      done();
    });
  });
  describe("/v1/citas_pacientes/tipo/horas_examenes", () => {
    it("Intenta obtener las horas de exámenes históricas de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas_pacientes/tipo/horas_examenes"
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get("/v1/citas_pacientes/tipo/horas_examenes")
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
        .get("/v1/citas_pacientes/tipo/horas_examenes")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
      const arregloHoras = respuesta.body;

      expect(arregloHoras.length).toStrictEqual(4);

      expect(arregloHoras[0].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[0].correlativoCita).toStrictEqual(13);
      expect(arregloHoras[0].codigoAmbito).toStrictEqual("04");

      expect(arregloHoras[1].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[1].correlativoCita).toStrictEqual(14);
      expect(arregloHoras[1].codigoAmbito).toStrictEqual("06");

      expect(arregloHoras[2].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[2].correlativoCita).toStrictEqual(15);
      expect(arregloHoras[2].codigoAmbito).toStrictEqual("06");

      expect(arregloHoras[3].numeroPaciente).toStrictEqual(1);
      expect(arregloHoras[3].correlativoCita).toStrictEqual(21);
      expect(arregloHoras[3].codigoAmbito).toStrictEqual("04");
      done();
    });
  });
  describe("/v1/citas_pacientes/tipo/horas_examenes/proximas/:timeZone", () => {
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas_pacientes/tipo/horas_examenes/proximas/${encodeURIComponent(
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
          `/v1/citas_pacientes/tipo/horas_examenes/proximas/${encodeURIComponent(
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
          `/v1/citas_pacientes/tipo/horas_examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
      const arregloDeArreglosHoras = respuesta.body;

      const arregloHorasHoy = arregloDeArreglosHoras[0];
      expect(arregloHorasHoy.length).toStrictEqual(2);

      expect(arregloHorasHoy[0].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasHoy[0].correlativoCita).toStrictEqual(14);
      expect(arregloHorasHoy[0].codigoAmbito).toStrictEqual("06");

      expect(arregloHorasHoy[1].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasHoy[1].correlativoCita).toStrictEqual(15);
      expect(arregloHorasHoy[1].codigoAmbito).toStrictEqual("06");

      const arregloHorasProximas = arregloDeArreglosHoras[1];
      expect(arregloHorasProximas.length).toStrictEqual(1);

      expect(arregloHorasProximas[0].numeroPaciente).toStrictEqual(1);
      expect(arregloHorasProximas[0].correlativoCita).toStrictEqual(21);
      expect(arregloHorasProximas[0].codigoAmbito).toStrictEqual("04");
      done();
    });
  });
  describe("/v1/citas_pacientes/tipo/horas_examenes/historico/:timeZone", () => {
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas_pacientes/tipo/horas_examenes/historico/${encodeURIComponent(
          "America/Santiago"
        )}`
      );
      expect(respuesta.status).toBe(401);
      expect(respuesta.body.respuesta).toBeTruthy();
      done();
    });
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 2 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/tipo/horas_examenes/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      const arregloHorasMedicas = respuesta.body;
      expect(arregloHorasMedicas).toStrictEqual([]);
      expect(arregloHorasMedicas.length).toStrictEqual(0);
      done();
    });
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente con token (Arreglo con horas de exámenes)", async (done) => {
      token = jwt.sign({ numeroPaciente: 1 }, secreto);
      const respuesta = await request
        .get(
          `/v1/citas_pacientes/tipo/horas_examenes/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);

      const arreglosHoras = respuesta.body;

      expect(arreglosHoras.length).toStrictEqual(1);

      expect(arreglosHoras[0].numeroPaciente).toStrictEqual(1);
      expect(arreglosHoras[0].correlativoCita).toStrictEqual(13);
      expect(arreglosHoras[0].codigoAmbito).toStrictEqual("04");
      done();
    });
  });
});
