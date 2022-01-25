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
  await mongoose.connect(`${process.env.MONGO_URI}/citas_pacientes_examenes_test`, {
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
