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
});
