const app = require("../api/app");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const moment = require("moment");
const citasPacientesSeeds = require("../tests/testSeeds/citasPacientesSeeds.json");
const diasFeriadosSeeds = require("../tests/testSeeds/diasFeriadosSeeds.json");
const { cargarFeriados } = require("../api/config");

const CitasPacientes = require("../api/models/CitasPacientes");
const DiasFeriados = require("../api/models/DiasFeriados");

const { getMensajes } = require("../api/config");
const ConfigApiCitasPacientes = require("../api/models/ConfigApiCitasPacientes");
const configSeed = require("../tests/testSeeds/configSeed.json");

const request = supertest(app);
const secreto = process.env.JWT_SECRET;
let token;

beforeAll(async (done) => {
  //Cerrar la conexión que se crea en el index.
  await mongoose.disconnect();
  //Conectar a la base de datos de prueba.
  await mongoose.connect(`${process.env.MONGO_URI}/citas_pacientes_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  //Cargar los seeds a la base de datos.
  await CitasPacientes.create(citasPacientesSeeds);
  await DiasFeriados.create(diasFeriadosSeeds);
  await ConfigApiCitasPacientes.create(configSeed);
  //Fechas para preparar escenarios de prueba.
  const fechaHoy = new Date();
  const fechaHoy1 = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate(),
    0,
    0,
    0,
    0
  );
  const fechaFeriado = new Date(moment(fechaHoy1, "DD-MM-YYYY").add(1, "days"));
  let diaFeriado = fechaFeriado.getDate();
  let mesFeriado = 1 + fechaFeriado.getMonth(); //Date usa los meses de 0 a 11
  if (fechaFeriado.getDate() < 10) diaFeriado = "0" + diaFeriado;
  if (fechaFeriado.getMonth() < 10) mesFeriado = "0" + mesFeriado;
  await DiasFeriados.create({
    fecha: fechaFeriado.getFullYear() + "-" + mesFeriado + "-" + diaFeriado,
  });
  cargarFeriados();
  const fechaAnterior1 = new Date(fechaHoy.getFullYear() - 2, 0, 1, 0, 0, 0, 0);
  const fechaAnterior2 = new Date(fechaHoy.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
  const fechaAnterior3 = new Date(
    fechaHoy1.getFullYear(),
    fechaHoy1.getMonth(),
    fechaHoy1.getDate() - 1,
    0,
    0,
    0,
    0
  );
  const fechaPosterior1 = new Date(
    fechaHoy1.getFullYear(),
    fechaHoy1.getMonth(),
    fechaHoy1.getDate() + 1,
    0,
    0,
    0,
    0
  );
  const fechaPosterior2 = new Date(
    fechaHoy.getFullYear() + 1,
    2,
    1,
    0,
    0,
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
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 18 },
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 19 },
      { fechaCitacion: fechaHoy1 }
    ),
    CitasPacientes.updateOne(
      { correlativoCita: 20 },
      { fechaCitacion: fechaPosterior1 }
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
  await ConfigApiCitasPacientes.deleteMany();
  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();
  done();
});

const citaBloqueada = {
  correlativoCita: 200,
  nombreLugar: "lugar",
  codigoServicio: "0001",
  nombreServicio: "Medicina general",
  codigoProfesional: "11111111-1",
  nombreProfesional: "doctor",
  fechaCitacion: "2021-08-31T16:30:00.000Z",
  horaCitacion: "12:30",
  numeroPaciente: 1,
  codigoAmbito: "01",
  tipoCita: "N",
  alta: false,
  blockedAt: "2021-08-25T04:00:00.000Z",
};

describe("Endpoints", () => {
  const fecha = new Date();
  const fechaHoy = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    0,
    0,
    0,
    0
  );
  const fechaAnterior1 = new Date(fechaHoy.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
  const fechaHoy1 = new Date(
    fechaHoy.getFullYear(),
    fechaHoy.getMonth(),
    fechaHoy.getDate(),
    0,
    0,
    0,
    0
  );
  const fechaPosterior1 = new Date(
    fechaHoy.getFullYear() + 1,
    1,
    1,
    0,
    0,
    0,
    0
  );
  describe("GET /v1/citas-pacientes/:idCita", () => {
    it("Intenta obtener una cita sin token", async (done) => {
      const respuesta = await request.get("/v1/citas-pacientes/000000000000");

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Intenta obtener una cita que no existe con token", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/000000000010")
        .set("Authorization", token);
      const cita = respuesta.body;

      expect(respuesta.status).toBe(200);
      expect(cita).toStrictEqual({});

      done();
    });
    it("Intenta obtener una cita con token", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/000000000011")
        .set("Authorization", token);
      const cita = respuesta.body;

      expect(respuesta.status).toBe(200);
      expect(cita.correlativoCita).toStrictEqual(11);

      done();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-medicas", () => {
    it("Intenta obtener las horas médicas de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas-pacientes/tipo/horas-medicas"
      );

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Intenta obtener las horas médicas de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-medicas")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo está vacío.
      const arregloHorasMedicas = respuesta.body;

      expect(arregloHorasMedicas).toStrictEqual([]);
      expect(arregloHorasMedicas.length).toStrictEqual(0);

      done();
    });
    it("Intenta obtener las horas médicas de un paciente con token (Arreglo con horas médicas)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-medicas")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 11 horas médicas y que todas son del mismo paciente.
      const arregloHoras = respuesta.body;

      arregloHoras.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arregloHoras.length).toStrictEqual(12);

      expect(arregloHoras[0].numeroPaciente).toBeFalsy();
      expect(arregloHoras[0].correlativoCita).toStrictEqual(11);
      expect(arregloHoras[0].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[1].numeroPaciente).toBeFalsy();
      expect(arregloHoras[1].correlativoCita).toStrictEqual(12);
      expect(arregloHoras[1].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[2].numeroPaciente).toBeFalsy();
      expect(arregloHoras[2].correlativoCita).toStrictEqual(17);
      expect(arregloHoras[2].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[3].numeroPaciente).toBeFalsy();
      expect(arregloHoras[3].correlativoCita).toStrictEqual(18);
      expect(arregloHoras[3].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[4].numeroPaciente).toBeFalsy();
      expect(arregloHoras[4].correlativoCita).toStrictEqual(19);
      expect(arregloHoras[4].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[5].numeroPaciente).toBeFalsy();
      expect(arregloHoras[5].correlativoCita).toStrictEqual(20);
      expect(arregloHoras[5].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[6].numeroPaciente).toBeFalsy();
      expect(arregloHoras[6].correlativoCita).toStrictEqual(24);
      expect(arregloHoras[6].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[7].numeroPaciente).toBeFalsy();
      expect(arregloHoras[7].correlativoCita).toStrictEqual(25);
      expect(arregloHoras[7].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[8].numeroPaciente).toBeFalsy();
      expect(arregloHoras[8].correlativoCita).toStrictEqual(26);
      expect(arregloHoras[8].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[9].numeroPaciente).toBeFalsy();
      expect(arregloHoras[9].correlativoCita).toStrictEqual(27);
      expect(arregloHoras[9].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[10].numeroPaciente).toBeFalsy();
      expect(arregloHoras[10].correlativoCita).toStrictEqual(28);
      expect(arregloHoras[10].codigoAmbito).toStrictEqual("01");

      expect(arregloHoras[11].numeroPaciente).toBeFalsy();
      expect(arregloHoras[11].correlativoCita).toStrictEqual(29);
      expect(arregloHoras[11].codigoAmbito).toStrictEqual("01");

      done();
    });
    it("Intenta obtener las horas médicas de un paciente con token (Hora bloqueada)", async (done) => {
      //Crear Hora médica bloqueada.
      await CitasPacientes.create(citaBloqueada);
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-medicas")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 12 horas médicas.
      const arregloHoras = respuesta.body;
      expect(arregloHoras.length).toStrictEqual(12);
      //Comprobar que hay 13.
      const arregloTodas = await CitasPacientes.find({
        numeroPaciente: 1,
        codigoAmbito: "01",
      });
      expect(arregloTodas.length).toStrictEqual(13);
      //Eliminar hora médica Bloqueada.
      await CitasPacientes.deleteOne({ correlativoCita: 200 });
      done();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-medicas/proximas/:timeZone", () => {
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas-pacientes/tipo/horas-medicas/proximas/${encodeURIComponent(
          "America/Santiago"
        )}`
      );
      const mensaje = await getMensajes("forbiddenAccess");
      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });
      done();
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/proximas/${encodeURIComponent(
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);

      //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
      const arregloDeArreglosHoras = respuesta.body;

      const arregloHorasHoy = arregloDeArreglosHoras[0];

      arregloHorasHoy.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arregloHorasHoy.length).toStrictEqual(3);

      expect(arregloHorasHoy[0].numeroPaciente).toBeFalsy();
      expect(arregloHorasHoy[0].correlativoCita).toStrictEqual(17);
      expect(arregloHorasHoy[0].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasHoy[1].numeroPaciente).toBeFalsy();
      expect(arregloHorasHoy[1].correlativoCita).toStrictEqual(18);
      expect(arregloHorasHoy[1].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasHoy[2].numeroPaciente).toBeFalsy();
      expect(arregloHorasHoy[2].correlativoCita).toStrictEqual(19);
      expect(arregloHorasHoy[2].codigoAmbito).toStrictEqual("01");

      const arregloHorasProximas = arregloDeArreglosHoras[1];

      arregloHorasProximas.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arregloHorasProximas.length).toStrictEqual(7);

      expect(arregloHorasProximas[0].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[0].correlativoCita).toStrictEqual(20);
      expect(arregloHorasProximas[0].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[1].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[1].correlativoCita).toStrictEqual(24);
      expect(arregloHorasProximas[1].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[2].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[2].correlativoCita).toStrictEqual(25);
      expect(arregloHorasProximas[2].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[3].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[3].correlativoCita).toStrictEqual(26);
      expect(arregloHorasProximas[3].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[4].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[4].correlativoCita).toStrictEqual(27);
      expect(arregloHorasProximas[4].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[5].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[5].correlativoCita).toStrictEqual(28);
      expect(arregloHorasProximas[5].codigoAmbito).toStrictEqual("01");

      expect(arregloHorasProximas[6].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[6].correlativoCita).toStrictEqual(29);
      expect(arregloHorasProximas[6].codigoAmbito).toStrictEqual("01");

      done();
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Horas bloqueadas)", async (done) => {
      //Crear Hora médica bloqueada.
      citaBloqueada.fechaCitacion = fechaHoy1;
      await CitasPacientes.create(citaBloqueada);
      citaBloqueada.fechaCitacion = fechaPosterior1;
      citaBloqueada.correlativoCita = 201;
      await CitasPacientes.create(citaBloqueada);
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 3 horas médicas para hoy.
      const arregloHoras = respuesta.body;
      expect(arregloHoras[0].length).toStrictEqual(3);
      //Probar que el arreglo tiene 7 horas médicas para el futuro.
      expect(arregloHoras[1].length).toStrictEqual(7);
      //Comprobar que hay 12.
      const arregloTodas = await CitasPacientes.find({
        numeroPaciente: 1,
        codigoAmbito: "01",
        fechaCitacion: { $gte: fechaHoy },
      });
      expect(arregloTodas.length).toStrictEqual(12);
      //Eliminar hora médica bloqueada.
      await CitasPacientes.deleteOne({ correlativoCita: 200 });
      await CitasPacientes.deleteOne({ correlativoCita: 201 });
      citaBloqueada.fechaCitacion = "2021-08-31T16:30:00.000Z";
      citaBloqueada.correlativoCita = 200;
      done();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-medicas/historico/:timeZone", () => {
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas-pacientes/tipo/horas-medicas/historico/${encodeURIComponent(
          "America/Santiago"
        )}`
      );

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente con token (Arreglo sin horas médicas)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/historico/${encodeURIComponent(
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const arreglosHoras = respuesta.body;

      arreglosHoras.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arreglosHoras.length).toStrictEqual(2);

      expect(arreglosHoras[0].numeroPaciente).toBeFalsy();
      expect(arreglosHoras[0].correlativoCita).toStrictEqual(11);
      expect(arreglosHoras[0].codigoAmbito).toStrictEqual("01");

      expect(arreglosHoras[1].numeroPaciente).toBeFalsy();
      expect(arreglosHoras[1].correlativoCita).toStrictEqual(12);
      expect(arreglosHoras[1].codigoAmbito).toStrictEqual("01");

      done();
    });
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente con token (Horas bloqueadas)", async (done) => {
      //Crear Hora médica bloqueada.
      citaBloqueada.fechaCitacion = fechaAnterior1;
      await CitasPacientes.create(citaBloqueada);
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 2 horas médicas pasadas.
      const arregloHoras = respuesta.body;
      expect(arregloHoras.length).toStrictEqual(2);
      //Comprobar que hay 3 horas médicas pasadas.
      const arregloTodas = await CitasPacientes.find({
        numeroPaciente: 1,
        codigoAmbito: "01",
        fechaCitacion: { $lt: fechaHoy1 },
      });

      expect(arregloTodas.length).toStrictEqual(3);
      //Eliminar hora médica bloqueada.
      await CitasPacientes.deleteOne({ correlativoCita: 200 });
      citaBloqueada.fechaCitacion = "2021-08-31T16:30:00.000Z";
      done();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-examenes", () => {
    it("Intenta obtener las horas de exámenes históricas de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas-pacientes/tipo/horas-examenes"
      );

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-examenes")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      //Probar que el arreglo está vacío.
      const arregloHorasMedicas = respuesta.body;

      expect(arregloHorasMedicas).toStrictEqual([]);
      expect(arregloHorasMedicas.length).toStrictEqual(0);

      done();
    });
    it("Intenta obtener las horas de exámenes históricas de un paciente con token (Arreglo con horas de exámenes)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-examenes")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      //Probar que el arreglo tiene cinco horas médicas y que todas son del mismo paciente.
      const arregloHoras = respuesta.body;

      arregloHoras.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arregloHoras.length).toStrictEqual(4);

      expect(arregloHoras[0].numeroPaciente).toBeFalsy();
      expect(arregloHoras[0].correlativoCita).toStrictEqual(13);
      expect(arregloHoras[0].codigoAmbito).toStrictEqual("04");

      expect(arregloHoras[1].numeroPaciente).toBeFalsy();
      expect(arregloHoras[1].correlativoCita).toStrictEqual(14);
      expect(arregloHoras[1].codigoAmbito).toStrictEqual("06");

      expect(arregloHoras[2].numeroPaciente).toBeFalsy();
      expect(arregloHoras[2].correlativoCita).toStrictEqual(15);
      expect(arregloHoras[2].codigoAmbito).toStrictEqual("06");

      expect(arregloHoras[3].numeroPaciente).toBeFalsy();
      expect(arregloHoras[3].correlativoCita).toStrictEqual(21);
      expect(arregloHoras[3].codigoAmbito).toStrictEqual("04");

      done();
    });
    it("Intenta obtener las horas de exámenes de un paciente con token (Hora bloqueada)", async (done) => {
      //Crear hora examen bloqueada.
      citaBloqueada.codigoAmbito = "06";
      await CitasPacientes.create(citaBloqueada);
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-examenes")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 4 horas médicas.
      const arregloHoras = respuesta.body;
      expect(arregloHoras.length).toStrictEqual(4);
      //Comprobar que hay 5.
      const arregloTodas = await CitasPacientes.find({
        numeroPaciente: 1,
        codigoAmbito: { $in: ["06", "04"] },
      });
      expect(arregloTodas.length).toStrictEqual(5);
      //Eliminar hora examen bloqueada.
      await CitasPacientes.deleteOne({ correlativoCita: 200 });
      citaBloqueada.codigoAmbito = "01";
      done();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-examenes/proximas/:timeZone", () => {
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas-pacientes/tipo/horas-examenes/proximas/${encodeURIComponent(
          "America/Santiago"
        )}`
      );

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/proximas/${encodeURIComponent(
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      //Probar que el arreglo tiene dos arreglos de hora médicas y que todas son del mismo paciente.
      const arregloDeArreglosHoras = respuesta.body;

      const arregloHorasHoy = arregloDeArreglosHoras[0];

      arregloHorasHoy.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arregloHorasHoy.length).toStrictEqual(2);

      expect(arregloHorasHoy[0].numeroPaciente).toBeFalsy();
      expect(arregloHorasHoy[0].correlativoCita).toStrictEqual(14);
      expect(arregloHorasHoy[0].codigoAmbito).toStrictEqual("06");

      expect(arregloHorasHoy[1].numeroPaciente).toBeFalsy();
      expect(arregloHorasHoy[1].correlativoCita).toStrictEqual(15);
      expect(arregloHorasHoy[1].codigoAmbito).toStrictEqual("06");

      const arregloHorasProximas = arregloDeArreglosHoras[1];

      arregloHorasProximas.sort(function (anterior, siguiente) {
        return anterior.correlativoCita - siguiente.correlativoCita;
      });

      expect(arregloHorasProximas.length).toStrictEqual(1);

      expect(arregloHorasProximas[0].numeroPaciente).toBeFalsy();
      expect(arregloHorasProximas[0].correlativoCita).toStrictEqual(21);
      expect(arregloHorasProximas[0].codigoAmbito).toStrictEqual("04");

      done();
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Horas bloqueadas)", async (done) => {
      //Crear Hora médica bloqueada.
      citaBloqueada.fechaCitacion = fechaHoy1;
      citaBloqueada.codigoAmbito = "04";
      await CitasPacientes.create(citaBloqueada);
      citaBloqueada.fechaCitacion = fechaPosterior1;
      citaBloqueada.correlativoCita = 201;
      citaBloqueada.codigoAmbito = "06";
      await CitasPacientes.create(citaBloqueada);
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene 2 horas de exámenes para hoy.
      const arregloHoras = respuesta.body;
      expect(arregloHoras[0].length).toStrictEqual(2);
      //Probar que el arreglo tiene 1 hora de exámenes para el futuro.
      expect(arregloHoras[1].length).toStrictEqual(1);
      //Comprobar que hay 5.
      const arregloTodas = await CitasPacientes.find({
        numeroPaciente: 1,
        codigoAmbito: { $in: ["06", "04"] },
        fechaCitacion: { $gte: fechaHoy },
      });
      expect(arregloTodas.length).toStrictEqual(5);
      //Eliminar horas bloqueadas.
      await CitasPacientes.deleteOne({ correlativoCita: 200 });
      await CitasPacientes.deleteOne({ correlativoCita: 201 });
      citaBloqueada.fechaCitacion = "2021-08-31T16:30:00.000Z";
      citaBloqueada.correlativoCita = 200;
      citaBloqueada.codigoAmbito = "01";
      done();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-examenes/historico/:timeZone", () => {
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente sin token", async (done) => {
      const respuesta = await request.get(
        `/v1/citas-pacientes/tipo/horas-examenes/historico/${encodeURIComponent(
          "America/Santiago"
        )}`
      );

      const mensaje = await getMensajes("forbiddenAccess");

      expect(respuesta.status).toBe(401);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 2,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/historico/${encodeURIComponent(
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
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const arreglosHoras = respuesta.body;

      expect(arreglosHoras.length).toStrictEqual(1);

      expect(arreglosHoras[0].numeroPaciente).toBeFalsy();
      expect(arreglosHoras[0].correlativoCita).toStrictEqual(13);
      expect(arreglosHoras[0].codigoAmbito).toStrictEqual("04");

      done();
    });
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente con token (Horas bloqueadas)", async (done) => {
      //Crear Hora médica bloqueada.
      citaBloqueada.fechaCitacion = fechaAnterior1;
      citaBloqueada.codigoAmbito = "06";
      await CitasPacientes.create(citaBloqueada);
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);
      //Probar que el arreglo tiene una hora de examen pasada.
      const arregloHoras = respuesta.body;
      expect(arregloHoras.length).toStrictEqual(1);
      //Comprobar que hay 2 horas de exámenes pasadas.
      const arregloTodas = await CitasPacientes.find({
        numeroPaciente: 1,
        codigoAmbito: { $in: ["06", "04"] },
        fechaCitacion: { $lt: fechaHoy1 },
      });
      expect(arregloTodas.length).toStrictEqual(2);
      //Eliminar hora de examen bloqueada.
      await CitasPacientes.deleteOne({ correlativoCita: 200 });
      citaBloqueada.codigoAmbito = "01";
      citaBloqueada.fechaCitacion = "2021-08-31T16:30:00.000Z";
      done();
    });
  });
});
