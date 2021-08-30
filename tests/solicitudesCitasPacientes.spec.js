const app = require("../api/app");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const moment = require("moment");
const citasPacientesSeeds = require("../tests/testSeeds/citasPacientesSeeds.json");
const diasFeriadosSeeds = require("../tests/testSeeds/diasFeriadosSeeds.json");
const solicitudesAnularCambiarCitasPacientesSeeds = require("../tests/testSeeds/solicitudesAnularCambiarCitasPacientesSeeds.json");
const motivosSolicitudesCitas = require("../tests/testSeeds/motivosSolicitudesCitasSeeds.json");
const { cargarFeriados } = require("../api/config");

const CitasPacientes = require("../api/models/CitasPacientes");
const DiasFeriados = require("../api/models/DiasFeriados");
const SolicitudesAnularCambiarCitasPacientes = require("../api/models/SolicitudesAnularCambiarCitasPacientes");
const MotivosSolicitudesCitas = require("../api/models/MotivosSolicitudesCitas");

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
  await ConfigApiCitasPacientes.create(configSeed);
  await SolicitudesAnularCambiarCitasPacientes.create(
    solicitudesAnularCambiarCitasPacientesSeeds
  );
  await MotivosSolicitudesCitas.create(motivosSolicitudesCitas);
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
  await ConfigApiCitasPacientes.deleteMany();
  await SolicitudesAnularCambiarCitasPacientes.deleteMany();
  await MotivosSolicitudesCitas.deleteMany();
  //Cerrar la conexión a la base de datos despues de la pruebas.
  await mongoose.connection.close();
  done();
});

describe("Endpoints", () => {
  describe("GET /v1/citas-pacientes/solicitudes/motivos/:tipoSolicitud", () => {
    it("Intenta obtener los motivos sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas-pacientes/solicitudes/motivos/ANULAR"
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
    it("Intenta obtener los motivos de un tipo de solicitud que no existe con token", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente:  1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/solicitudes/motivos/PEDIR")
        .set("Authorization", token);

      const arregloMotivos = respuesta.body;

      expect(respuesta.status).toBe(200);
      expect(arregloMotivos).toStrictEqual([]);

      done();
    });
    it("Intenta obtener los motivos de un tipo de solicitud ANULAR con token", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/solicitudes/motivos/ANULAR")
        .set("Authorization", token);

      const arregloMotivos = respuesta.body;

      expect(respuesta.status).toBe(200);
      expect(arregloMotivos[0].nombre).toStrictEqual("No requiero la hora");
      expect(arregloMotivos[1].nombre).toStrictEqual("Ya me atendí");
      expect(arregloMotivos[2].nombre).toStrictEqual("Otro");

      done();
    });
    it("Intenta obtener los motivos de un tipo de solicitud CAMBIAR con token", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get("/v1/citas-pacientes/solicitudes/motivos/CAMBIAR")
        .set("Authorization", token);

      const arregloMotivos = respuesta.body;

      expect(respuesta.status).toBe(200);
      expect(arregloMotivos[0].nombre).toStrictEqual("No puedo asistir");
      expect(arregloMotivos[1].nombre).toStrictEqual(
        "Quiero cambio de profesional"
      );
      expect(arregloMotivos[2].nombre).toStrictEqual("Otro");

      done();
    });
  });
  describe("POST /v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/", () => {
    it("Solicitud sin token.", async (done) => {
      const respuesta = await request.post(
        "/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/"
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
    it("Solicitud sin tipoSolicitud.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000000",
        correlativoCita: 11,
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud ANULAR sin correlativoCita.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000000",
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud CAMBIAR sin correlativoCita.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000000",
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud ANULAR sin idCita.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        correlativoCita: 3,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud CAMBIAR sin idCita.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        correlativoCita: 3,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud ANULAR hora médica inexistente.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000000",
        correlativoCita: 3,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud CAMBIAR hora médica inexistente.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000000",
        correlativoCita: 3,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud CAMBIAR con menos de 3 días hábiles antes de la hora médica (hoy).", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000017",
        correlativoCita: 17,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud CAMBIAR con menos de 3 días hábiles antes de la hora médica (próxima).", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000020",
        correlativoCita: 20,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud ANULAR con menos de 1 día hábil antes de la hora médica (hoy).", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000017",
        correlativoCita: 17,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
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
    it("Solicitud CAMBIAR con más de 3 días hábiles antes de la hora médica.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000024",
        correlativoCita: 24,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("solicitudCreada");

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Borrar solicitud
      await SolicitudesAnularCambiarCitasPacientes.deleteOne({
        correlativoCita: 24,
      });

      done();
    });
    it("Solicitud ANULAR con más de 1 día hábil antes de la hora médica.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000020",
        correlativoCita: 20,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };
      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("solicitudCreada");

      expect(respuesta.status).toBe(201);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Borrar solicitud
      await SolicitudesAnularCambiarCitasPacientes.deleteOne({
        correlativoCita: 20,
      });

      done();
    });
    it("Solicitud ANULAR, que ya fue solicitada previamente.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000026",
        correlativoCita: 26,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };

      //Crear solicitud
      await SolicitudesAnularCambiarCitasPacientes.create({
        numeroPaciente: 1,
        correlativoCita: 26,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      });

      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Borrar solicitud
      await SolicitudesAnularCambiarCitasPacientes.deleteOne({
        correlativoCita: 26,
      });

      done();
    });
    it("Solicitud CAMBIAR, que ya fue solicitada previamente.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000027",
        correlativoCita: 27,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };

      //Crear solicitud
      await SolicitudesAnularCambiarCitasPacientes.create({
        numeroPaciente: 1,
        correlativoCita: 27,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      });

      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Borrar solicitud
      await SolicitudesAnularCambiarCitasPacientes.deleteOne({
        correlativoCita: 27,
      });

      done();
    });
    it("Solicitud CAMBIAR, que ya fue solicitada ANULAR previamente.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000026",
        correlativoCita: 26,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      };

      //Crear solicitud
      await SolicitudesAnularCambiarCitasPacientes.create({
        numeroPaciente: 1,
        correlativoCita: 26,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      });

      body.tipoSolicitud = "CAMBIAR";

      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Borrar solicitud
      await SolicitudesAnularCambiarCitasPacientes.deleteOne({
        correlativoCita: 26,
      });

      done();
    });
    it("Solicitud ANULAR, que ya fue solicitada CAMBIAR previamente.", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      let body = {
        idCita: "000000000027",
        correlativoCita: 27,
        tipoSolicitud: "CAMBIAR",
        motivo: 1,
        detallesMotivo: "",
      };

      //Crear solicitud
      await SolicitudesAnularCambiarCitasPacientes.create({
        numeroPaciente: 1,
        correlativoCita: 27,
        tipoSolicitud: "ANULAR",
        motivo: 1,
        detallesMotivo: "",
      });

      body.tipoSolicitud = "ANULAR";

      const respuesta = await request
        .post("/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/")
        .set("Authorization", token)
        .send(body);

      const mensaje = await getMensajes("badRequest");

      expect(respuesta.status).toBe(400);
      expect(respuesta.body).toEqual({
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      //Borrar solicitud
      await SolicitudesAnularCambiarCitasPacientes.deleteOne({
        correlativoCita: 27,
      });

      done();
    });
  });
  describe("GET /v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/existe/:idCita", () => {
    it("Intenta averiguar si existe una solicitud para una cita sin token", async (done) => {
      const respuesta = await request.get(
        "/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/existe/000000000011"
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
    it("Intenta averiguar si existe una solicitud para una cita, que no existe, con token", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          "/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/existe/000000000000"
        )
        .set("Authorization", token);

      const mensaje = await getMensajes("badRequest");
      expect(respuesta.status).toBe(400);
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
    it("Intenta averiguar si existe una solicitud para una cita, con token (No existe la solicitud).", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          "/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/existe/000000000011"
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({ existeSolicitud: false });

      done();
    });
    it("Intenta averiguar si existe una solicitud para una cita, con token (Existe la solicitud).", async (done) => {
      token = jwt.sign(
        {
          _id: "000000000000",
          numeroPaciente: 1,
        },
        secreto
      );
      const respuesta = await request
        .get(
          "/v1/citas-pacientes/solicitudes/horas-medicas/anular-cambiar/existe/000000000012"
        )
        .set("Authorization", token);

      const mensaje = await getMensajes("solicitudDuplicada");

      expect(respuesta.status).toBe(200);
      expect(respuesta.body).toEqual({
        existeSolicitud: true,
        respuesta: {
          titulo: mensaje.titulo,
          mensaje: mensaje.mensaje,
          color: mensaje.color,
          icono: mensaje.icono,
        },
      });

      done();
    });
  });
});
