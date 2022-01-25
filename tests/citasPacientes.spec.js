const app = require("../api/app");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const supertest = require("supertest");
const CitasPacientes = require("../api/models/CitasPacientes");
const citasPacientesSeeds = require("./testSeeds/citasPacientesSeeds.json");
const ConfigApiCitasPacientes = require("../api/models/ConfigApiCitasPacientes");
const configSeed = require("./testSeeds/configSeed.json");
const { getMensajes } = require("../api/config");
const moment = require("moment")

const request = supertest(app);

const secreto = process.env.JWT_SECRET;

const token = jwt.sign(
  {
    _id: "000000000000",
    rut: "11111111-1",
  },
  secreto
);

const tokenUsuarioSinDatos = jwt.sign(
  {
    _id: "000000000000",
    rut: "33333333-3",
  },
  secreto
);

const setCurrentDates = async (datesDisplacement) => {
  const citas = await CitasPacientes.find().select("_id").exec();

  let indice = 0;
  for (let cita of citas) {
    await CitasPacientes.updateOne(
      { _id: cita._id },
      {
        fechaCitacion: moment().add(datesDisplacement[indice], "days"),
      }
    );
    indice++;
  }
};

beforeEach(async () => {
  await mongoose.disconnect();
  await mongoose.connect(`${process.env.MONGO_URI}/citas_pacientes_test`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await CitasPacientes.create(citasPacientesSeeds);
  await ConfigApiCitasPacientes.create(configSeed);
});

afterEach(async () => {
  await CitasPacientes.deleteMany();
  await ConfigApiCitasPacientes.deleteMany();
  await mongoose.connection.close();
});

describe("Endpoints", () => {
  describe("GET /v1/citas-pacientes/:idCita", () => {
    it("Intenta obtener una cita sin token", async () => {
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
    });
    it("Intenta obtener una cita que no existe con token", async () => {
      const respuesta = await request
        .get("/v1/citas-pacientes/000000000010")
        .set("Authorization", token);

      const cita = respuesta.body;

      expect(respuesta.status).toBe(200);
      expect(cita).toEqual({});
    });
    it("Intenta obtener una cita con token", async () => {
      const respuesta = await request
        .get("/v1/citas-pacientes/000000000011")
        .set("Authorization", token);

      const cita = respuesta.body;

      expect(respuesta.status).toBe(200);

      expect(cita.correlativo).toBe(11);
      expect(cita.codigoLugar).toBe("123");
      expect(cita.nombreLugar).toBe("HORAS IMAGENOLOGIA");
      expect(cita.codigoServicio).toBe("3000-4");
      expect(cita.nombreServicio).toBe("SCANNER URGENCIA");
      expect(cita.codigoProfesional).toBe("14604071-3");
      expect(cita.nombreProfesional).toBe("TECNOLOGO MEDICO IMAGENOLOGIA");
      expect(cita.tipo).toBe("C");
      expect(cita.codigoAmbito).toBe("01");
      expect(Date.parse(cita.fechaCitacion)).toBe(
        Date.parse("2019-01-02T14:21:01.643Z")
      );
      expect(cita.horaCitacion).toBe("08:30");
      expect(cita.rutPaciente).toBeFalsy();
      expect(cita.alta).toBeFalsy();
      expect(cita.bloqueadaEl).toBeFalsy();
      expect(cita.codigoEstablecimiento).toBe("HRA");
      expect(cita.nombreEstablecimiento).toBe(
        "Hospital Regional Antofagasta Dr. Leonardo Guzmán"
      );
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-medicas", () => {
    it("Intenta obtener las horas médicas de un paciente sin token", async () => {
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
    });
    it("Intenta obtener las horas médicas de un paciente con token (Arreglo sin horas médicas)", async () => {
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-medicas")
        .set("Authorization", tokenUsuarioSinDatos);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;

      expect(horasMedicas).toEqual([]);
    });
    it("Intenta obtener las horas médicas de un paciente con token (Arreglo con horas médicas)", async () => {
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-medicas")
        .set("Authorization", token);
      expect(respuesta.status).toBe(200);

      const horas = respuesta.body;

      expect(horas.length).toBe(12);

      expect(horas[0].rutPaciente).toBeFalsy();
      expect(horas[0].correlativo).toBe(11);
      expect(horas[0].codigoAmbito).toBe("01"); // "2019-01-02T14:21:01.643Z"

      expect(horas[0].codigoLugar).toBe("123");
      expect(horas[0].nombreLugar).toBe("HORAS IMAGENOLOGIA");
      expect(horas[0].codigoServicio).toBe("3000-4");
      expect(horas[0].nombreServicio).toBe("SCANNER URGENCIA");
      expect(horas[0].codigoProfesional).toBe("14604071-3");
      expect(horas[0].nombreProfesional).toBe("TECNOLOGO MEDICO IMAGENOLOGIA");
      expect(horas[0].tipo).toBe("C");
      expect(Date.parse(horas[0].fechaCitacion)).toBe(
        Date.parse("2019-01-02T14:21:01.643Z")
      );
      expect(horas[0].horaCitacion).toBe("08:30");
      expect(horas[0].rutPaciente).toBeFalsy();
      expect(horas[0].alta).toBeFalsy();
      expect(horas[0].bloqueadaEl).toBeFalsy();
      expect(horas[0].codigoEstablecimiento).toBe("HRA");
      expect(horas[0].nombreEstablecimiento).toBe(
        "Hospital Regional Antofagasta Dr. Leonardo Guzmán"
      );

      expect(horas[1].rutPaciente).toBeFalsy();
      expect(horas[1].correlativo).toBe(12);
      expect(horas[1].codigoAmbito).toBe("01"); // "2019-01-03T14:21:01.643Z"

      expect(horas[2].rutPaciente).toBeFalsy();
      expect(horas[2].correlativo).toBe(25);
      expect(horas[2].codigoAmbito).toBe("01"); // "2021-01-02T14:21:01.643Z"

      expect(horas[3].rutPaciente).toBeFalsy();
      expect(horas[3].correlativo).toBe(26);
      expect(horas[3].codigoAmbito).toBe("01"); // "2021-01-03T14:21:01.643Z"

      expect(horas[4].rutPaciente).toBeFalsy();
      expect(horas[4].correlativo).toBe(27);
      expect(horas[4].codigoAmbito).toBe("01"); // "2021-01-04T14:21:01.643Z"

      expect(horas[5].rutPaciente).toBeFalsy();
      expect(horas[5].correlativo).toBe(17);
      expect(horas[5].codigoAmbito).toBe("01"); // "2021-04-19T14:21:01.643Z"

      expect(horas[6].rutPaciente).toBeFalsy();
      expect(horas[6].correlativo).toBe(18);
      expect(horas[6].codigoAmbito).toBe("01"); // "2021-04-20T19:25:00.000Z"

      expect(horas[7].rutPaciente).toBeFalsy();
      expect(horas[7].correlativo).toBe(28);
      expect(horas[7].codigoAmbito).toBe("01"); // "2021-04-21T14:21:01.643Z"

      expect(horas[8].rutPaciente).toBeFalsy();
      expect(horas[8].correlativo).toBe(29);
      expect(horas[8].codigoAmbito).toBe("01"); // "2021-04-22T19:25:00.000Z"

      expect(horas[9].rutPaciente).toBeFalsy();
      expect(horas[9].correlativo).toBe(19);
      expect(horas[9].codigoAmbito).toBe("01"); // "2021-05-19T19:25:00.000Z"

      expect(horas[10].rutPaciente).toBeFalsy();
      expect(horas[10].correlativo).toBe(20);
      expect(horas[10].codigoAmbito).toBe("01"); // "2021-05-20T19:25:00.000Z"

      expect(horas[11].rutPaciente).toBeFalsy();
      expect(horas[11].correlativo).toBe(24);
      expect(horas[11].codigoAmbito).toBe("01"); // "2021-05-21T14:21:01.643Z"
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-medicas/proximas/:timeZone", () => {
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente sin token", async () => {
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
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo sin horas médicas)", async () => {
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", tokenUsuarioSinDatos);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;
      expect(horasMedicas.length).toBe(2);
      expect(horasMedicas[0].length).toBe(0);
      expect(horasMedicas[1].length).toBe(0);
    });
    it("Intenta obtener las horas médicas posteriores a hoy de un paciente con token (Arreglo con horas médicas)", async () => {
      await setCurrentDates([
        -9, -8, -7, -6, 5, -4, -3, -2, -1, 0, 0, 1, 2, 3, 4, -5, 6, 7, 8, 9,
      ]);
      // -9, -8, -7, -6,  5, -4, -3, -2, -1  ,0  ,0  ,1  ,2  ,3  ,4  ,-5   ,6   ,7  ,8   ,9
      // hm, hm, ex, ex, ex, hm, hm, hm, hm, ex, hm, hm, hm, hm, hm, hm, hmb, exb, hm2, ex2

      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;

      expect(horasMedicas.length).toBe(2);

      const horasHoy = horasMedicas[0];
      expect(horasHoy.length).toBe(1);
      expect(horasHoy[0].correlativo).toBe(24);
      expect(horasHoy[0].codigoAmbito).toBe("01");
      expect(horasHoy[0].rutPaciente).toBeFalsy();

      const horasProximas = horasMedicas[1];

      expect(horasProximas.length).toBe(4);

      expect(horasProximas[0].correlativo).toBe(25);
      expect(horasProximas[0].codigoAmbito).toBe("01");
      expect(horasProximas[0].rutPaciente).toBeFalsy();

      expect(horasProximas[1].correlativo).toBe(26);
      expect(horasProximas[1].codigoAmbito).toBe("01");
      expect(horasProximas[1].rutPaciente).toBeFalsy();

      expect(horasProximas[2].correlativo).toBe(27);
      expect(horasProximas[2].codigoAmbito).toBe("01");
      expect(horasProximas[2].rutPaciente).toBeFalsy();

      expect(horasProximas[3].correlativo).toBe(28);
      expect(horasProximas[3].codigoAmbito).toBe("01");
      expect(horasProximas[3].rutPaciente).toBeFalsy();
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-medicas/historico/:timeZone", () => {
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente sin token", async () => {
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
    });
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente con token (Arreglo sin horas médicas)", async () => {
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", tokenUsuarioSinDatos);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;

      expect(horasMedicas).toEqual([]);
      expect(horasMedicas.length).toBe(0);
    });
    it("Intenta obtener las horas médicas anteriores a hoy de un paciente con token (Arreglo con horas médicas)", async () => {
      await setCurrentDates([
        -9, -8, -7, -6, 5, -4, -3, -2, -1, 0, 0, 1, 2, 3, 4, -5, 6, 7, 8, 9,
      ]);
      // -9, -8, -7, -6,  5, -4, -3, -2, -1  ,0  ,0  ,1  ,2  ,3  ,4  ,-5   ,6   ,7  ,8   ,9
      // 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 29, 200, 201, 300, 301
      // hm, hm, ex, ex, ex, hm, hm, hm, hm, ex, hm, hm, hm, hm, hm, hm, hmb, exb, hm2, ex2

      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-medicas/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const citas = respuesta.body;

      expect(citas.length).toBe(7);

      expect(citas[6].rutPaciente).toBeFalsy();
      expect(citas[6].correlativo).toBe(11);
      expect(citas[6].codigoAmbito).toBe("01");

      expect(citas[5].rutPaciente).toBeFalsy();
      expect(citas[5].correlativo).toBe(12);
      expect(citas[5].codigoAmbito).toBe("01");

      expect(citas[4].rutPaciente).toBeFalsy();
      expect(citas[4].correlativo).toBe(29);
      expect(citas[4].codigoAmbito).toBe("01");

      expect(citas[3].rutPaciente).toBeFalsy();
      expect(citas[3].correlativo).toBe(17);
      expect(citas[3].codigoAmbito).toBe("01");

      expect(citas[2].rutPaciente).toBeFalsy();
      expect(citas[2].correlativo).toBe(18);
      expect(citas[2].codigoAmbito).toBe("01");

      expect(citas[1].rutPaciente).toBeFalsy();
      expect(citas[1].correlativo).toBe(19);
      expect(citas[1].codigoAmbito).toBe("01");

      expect(citas[0].rutPaciente).toBeFalsy();
      expect(citas[0].correlativo).toBe(20);
      expect(citas[0].codigoAmbito).toBe("01");
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-examenes", () => {
    it("Intenta obtener las horas de exámenes de un paciente sin token", async () => {
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
    });
    it("Intenta obtener las horas de exámenes de un paciente con token (Arreglo sin horas de exámenes)", async () => {
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-examenes")
        .set("Authorization", tokenUsuarioSinDatos);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;

      expect(horasMedicas).toEqual([]);
      expect(horasMedicas.length).toBe(0);
    });
    it("Intenta obtener las horas de exámenes de un paciente con token (Arreglo con horas de exámenes)", async () => {
      // 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 29, 200, 201, 300, 301
      // hm, hm, ex, ex, ex, hm, hm, hm, hm, ex, hm, hm, hm, hm, hm, hm, hmb, exb, hm2, ex2
      const respuesta = await request
        .get("/v1/citas-pacientes/tipo/horas-examenes")
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const horas = respuesta.body;

      expect(horas.length).toBe(4);

      expect(horas[0].rutPaciente).toBeFalsy();
      expect(horas[0].correlativo).toBe(13);
      expect(horas[0].codigoAmbito).toBe("04");

      expect(horas[1].rutPaciente).toBeFalsy();
      expect(horas[1].correlativo).toBe(14);
      expect(horas[1].codigoAmbito).toBe("06");

      expect(horas[2].rutPaciente).toBeFalsy();
      expect(horas[2].correlativo).toBe(15);
      expect(horas[2].codigoAmbito).toBe("06");

      expect(horas[3].rutPaciente).toBeFalsy();
      expect(horas[3].correlativo).toBe(21);
      expect(horas[3].codigoAmbito).toBe("04");
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-examenes/proximas/:timeZone", () => {
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente sin token", async () => {
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
    });
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)", async () => {
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", tokenUsuarioSinDatos);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;

      expect(horasMedicas).toEqual([[], []]);
      expect(horasMedicas.length).toBe(2);
      expect(horasMedicas[0].length).toBe(0);
      expect(horasMedicas[1].length).toBe(0);
    });
    it("Intenta obtener las horas de exámenes posteriores a hoy de un paciente con token (Arreglo con horas de exámenes)", async () => {
      await setCurrentDates([
        -9, -8, -7, -6, 5, -4, -3, -2, -1, 0, 0, 1, 2, 3, 4, -5, 6, 7, 8, 9,
      ]);
      // -9, -8, -7, -6,  5, -4, -3, -2, -1  ,0  ,0  ,1  ,2  ,3  ,4  ,-5   ,6   ,7  ,8   ,9
      // 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 29, 200, 201, 300, 301
      // hm, hm, ex, ex, ex, hm, hm, hm, hm, ex, hm, hm, hm, hm, hm, hm, hmb, exb, hm2, ex2

      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/proximas/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const horas = respuesta.body;

      const horasHoy = horas[0];

      expect(horasHoy.length).toBe(1);

      expect(horasHoy[0].rutPaciente).toBeFalsy();
      expect(horasHoy[0].correlativo).toBe(21);
      expect(horasHoy[0].codigoAmbito).toBe("04");

      const horasProximas = horas[1];

      expect(horasProximas.length).toBe(1);

      expect(horasProximas[0].rutPaciente).toBeFalsy();
      expect(horasProximas[0].correlativo).toBe(15);
      expect(horasProximas[0].codigoAmbito).toBe("06");
    });
  });
  describe("GET /v1/citas-pacientes/tipo/horas-examenes/historico/:timeZone", () => {
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente sin token", async () => {
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
    });
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente con token (Arreglo sin horas de exámenes)", async () => {
      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", tokenUsuarioSinDatos);

      expect(respuesta.status).toBe(200);

      const horasMedicas = respuesta.body;

      expect(horasMedicas).toEqual([]);
      expect(horasMedicas.length).toBe(0);
    });
    it("Intenta obtener las horas de exámenes anteriores a hoy de un paciente con token (Arreglo con horas de exámenes)", async () => {
      await setCurrentDates([
        -9, -8, -7, -6, 5, -4, -3, -2, -1, 0, 0, 1, 2, 3, 4, -5, 6, 7, 8, 9,
      ]);
      // -9, -8, -7, -6,  5, -4, -3, -2, -1  ,0  ,0  ,1  ,2  ,3  ,4  ,-5   ,6   ,7  ,8   ,9
      // 11, 12, 13, 14, 15, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 29, 200, 201, 300, 301
      // hm, hm, ex, ex, ex, hm, hm, hm, hm, ex, hm, hm, hm, hm, hm, hm, hmb, exb, hm2, ex2

      const respuesta = await request
        .get(
          `/v1/citas-pacientes/tipo/horas-examenes/historico/${encodeURIComponent(
            "America/Santiago"
          )}`
        )
        .set("Authorization", token);

      expect(respuesta.status).toBe(200);

      const horas = respuesta.body;

      expect(horas.length).toBe(2);

      expect(horas[0].rutPaciente).toBeFalsy();
      expect(horas[0].correlativo).toBe(14);
      expect(horas[0].codigoAmbito).toBe("06");

      expect(horas[1].rutPaciente).toBeFalsy();
      expect(horas[1].correlativo).toBe(13);
      expect(horas[1].codigoAmbito).toBe("04");
    });
  });
});
