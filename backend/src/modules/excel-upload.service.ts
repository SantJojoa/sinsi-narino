import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';

type UploadedExcelFile = {
  buffer: Buffer;
  originalname: string;
  mimetype?: string;
  size?: number;
};

type ColumnSpec = {
  key: string;
  label: string;
  aliases: string[];
  required?: boolean;
  options?: string[];
};

type TemplateSpec = {
  sheetNames: string[];
  columns: ColumnSpec[];
  headerSearchRows?: number;
  maxDataRow?: number;
};

type ColumnMatch = ColumnSpec & { index: number };

type RowValidation = {
  rowNumber: number;
  data: Record<string, string>;
  errors: string[];
};

type ValidationResult = {
  moduleKey: string;
  fileName: string;
  sheetName?: string;
  message?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: Array<{ rowNumber: number; errors: string[] }>;
};

const DEPARTAMENTOS_CO = [
  '05 Antioquia', '08 Atlántico', '11 Bogotá', '13 Bolívar', '15 Boyacá',
  '17 Caldas', '18 Caquetá', '19 Cauca', '20 Cesar', '23 Córdoba',
  '25 Cundinamarca', '27 Chocó', '41 Huila', '44 La Guajira', '47 Magdalena',
  '50 Meta', '52 Nariño', '54 Norte de Santander', '63 Quindío', '66 Risaralda',
  '68 Santander', '70 Sucre', '73 Tolima', '76 Valle del Cauca', '81 Arauca',
  '85 Casanare', '86 Putumayo', '88 Archipiélago de San Andrés y Providencia',
  '91 Amazonas', '94 Guainía', '95 Guaviare', '97 Vaupés', '99 Vichada',
];

const MUNICIPIOS_NARINO = [
  'Pasto', 'Albán', 'Aldana', 'Ancuya', 'Arboleda', 'Barbacoas', 'Belén',
  'Buesaco', 'Chachagüí', 'Colón', 'Consacá', 'Contadero', 'Córdoba',
  'Cuaspud', 'Cumbal', 'Cumbitara', 'El Charco', 'El Peñol', 'El Rosario',
  'El Tablón de Gómez', 'El Tambo', 'Francisco Pizarro', 'Funes',
  'Guachucal', 'Guaitarilla', 'Gualmatán', 'Iles', 'Imués', 'Ipiales',
  'La Cruz', 'La Florida', 'La Llanada', 'La Tola', 'La Unión', 'Leiva',
  'Linares', 'Los Andes', 'Magüí Payán', 'Mallama', 'Mosquera', 'Nariño',
  'Olaya Herrera', 'Ospina', 'Policarpa', 'Potosí', 'Providencia',
  'Puerres', 'Pupiales', 'Ricaurte', 'Roberto Payán', 'Samaniego',
  'San Bernardo', 'San Lorenzo', 'San Pablo', 'San Pedro de Cartago',
  'Sandoná', 'Santa Bárbara', 'Santacruz', 'Sapuyes', 'Taminango',
  'Tangua', 'Tumaco', 'Túquerres', 'Yacuanquer',
];

const EAPB_SUBSIDIADAS = [
  'EMSSANAR', 'SANITAS', 'ASMETSALUD', 'MALLAMAS', 'NUEVA EPS',
  'FIDUPREVISORA', 'DLS', 'OTRO',
];

const EAPB_NACIONAL = [
  'ESS024 / EPS042 COOSALUD EPS-S', 'EPS037 / EPSS41 NUEVA EPS',
  'ESS207 / EPS048 MUTUAL SER', 'EPS046 SALUD MIA', 'EPS001 ALIANSALUD EPS',
  'EPS002 SALUD TOTAL EPS S.A.', 'EPS005 EPS SANITAS', 'EPS010 EPS SURA',
  'EPS017 FAMISANAR', 'EPS018 SERVICIO OCCIDENTAL DE SALUD (SOS)',
  'EPS012 COMFENALCO VALLE', 'EPS008 COMPENSAR EPS',
  'EAS016 EPM – EMPRESAS PÚBLICAS DE MEDELLÍN',
  'EAS027 FONDO DE PASIVO SOCIAL DE FERROCARRILES NACIONALES',
  'CCF055 CAJACOPI ATLÁNTICO', 'EPS025 CAPRESOCA', 'CCF102 COMFACHOCO',
  'CCF050 COMFAORIENTE', 'CCF033 EPS FAMILIAR DE COLOMBIA',
  'ESS062 ASMET SALUD', 'ESS118 EMSSANAR E.S.S.',
  'EPSS34 CAPITAL SALUD EPS-S', 'EPSS40 SAVIA SALUD EPS',
  'EPSI01 DUSAKAWI EPSI', 'EPSI03 ASOCIACIÓN INDÍGENA DEL CAUCA EPSI',
  'EPSI04 ANAS WAYUU EPSI', 'EPSI05 MALLAMAS EPSI',
  'EPSI06 PIJAOS SALUD EPSI',
  'EAS MAGISTERIO (FONDO NACIONAL DE PRESTACIONES SOCIALES DEL MAGISTERIO)',
  'EAS FUERZAS MILITARES', 'EAS POLICÍA NACIONAL',
  'EAS UNIVERSIDAD NACIONAL DE COLOMBIA', 'Otra', 'Sin dato',
];

const REGIMEN_SGSSS = [
  'C- Contributivo', 'S- Subsidiado', 'E- Especial', 'N- No asegurado', 'P- Exepción',
];

const TIPO_IDENTIFICACION = [
  'RC: Registro Civil', 'TI: Tarjeta Identidad', 'MS: Menor sin identificacion', 'PA: Pasaporte',
];

const GRUPO_POBLACIONAL_ERA_UAIC = [
  'Migrante', 'Campesino', 'Desplazado', 'Gestante', 'LQBTIQ+',
  'Población centro de menores infractores', 'Población con discapacidad',
  'Población habitante de calle',
  'Población infantil en Unidades de Servicio de Primera Infancia en cárceles',
  'Población Infantil institucionalizada acargo del ICBF',
  'Población Privada de la Libertad', 'Trabajador de la Salud',
  'Victima de la violencia', 'Ninguno', 'Indigena', 'Afrocolombiano', 'Raizal', 'Rom',
];

function req(key: string, label: string, aliases: string[]): ColumnSpec {
  return { key, label, aliases };
}

function opt(
  key: string,
  label: string,
  aliases: string[],
  options: string[],
  required = true,
): ColumnSpec {
  return { key, label, aliases, options, required };
}

function optionalReq(key: string, label: string, aliases: string[]): ColumnSpec {
  return { key, label, aliases, required: false };
}

const RECIEN_NACIDO_TEMPLATE: TemplateSpec = {
  sheetNames: ['Matriz actualizada', 'Seguimiento Nominal RN'],
  columns: [
    req('numero', 'Número', ['Número']),
    req('fechaNacimiento', 'Fecha de nacimiento', ['Fecha de nacimiento']),
    req('fechaEgreso', 'Fecha de egreso', ['Fecha de egreso']),
    optionalReq('fechaControlRN', 'Fecha control de recién nacido', ['Fecha control de recién nacido']),
    optionalReq('dias', 'Días', ['Días']),
    req('nombresRN', 'Nombres y apellidos del recién nacido', ['Nombres y apellidos del recién nacido']),
    opt('registroCivil', 'Registro Civil', ['Registro Civil'], ['SI', 'NO']),
    req('identificacion', 'No de Identificación', ['No de Identificación']),
    opt('grupoPoblacional', 'Grupo poblacional', ['Grupo poblacional'], ['Indigena', 'Rom', 'Afro', 'Desplazado', 'Migrante', 'Ninguno']),
    opt('eapb', 'EAPB', ['EAPB'], EAPB_SUBSIDIADAS),
    opt('lugarParto', 'Lugar donde fue atendido el parto', ['Lugar donde fue atendido el parto'], ['Institucional', 'Domiciliario']),
    req('institucionNacimiento', 'Institución donde nació', ['Institución donde nacìo', 'Institución donde nació']),
    req('madreCuidador', 'Nombre y apellidos de la madre y/o acudiente', ['Nombre y apellidos de la madre y/o acudiente']),
    req('direccionMadre', 'Dirección habitual de la madre', ['Dirección habitual de la madre']),
    req('contactoMadre', 'Números de contacto de la madre y/o acudiente', ['Números de contacto de la madre y/o acudiente']),
    opt('tipoParto', 'Tipo de parto', ['Tipo de parto'], ['Vaginal', 'Cesarea']),
    opt('remitido', 'Remitido', ['Remitido'], ['SI', 'NO']),
    opt('hospitalizacionNacer', 'Hospitalización al nacer', ['Hospitalización al nacer'], ['SI', 'NO']),
    req('semanasGestacion', 'Semanas de gestación', ['Semanas de gestación']),
    opt('condicionesRN', 'Condiciones Recien Nacido', ['Condiciones Recien Nacido'], ['RN a termino', 'Pre termino', 'RN con bajo peso']),
    req('pesoRN', 'Peso de RN', ['Peso de RN']),
    opt('resultadoPesoRN', 'Resultado de peso de RN', ['Resultado de peso de RN'], ['PESO MENOS A 2500 KG', 'PESO MAYOR A 2500 KG']),
    req('fechaTomaMuestra', 'Fecha de la toma de la muestra', ['Fecha de la toma de la muestra']),
    opt('tomaMuestra', 'Toma de la muestra: talón o cordón', ['Toma de la muestra', 'talón o cordón'], ['Talon', 'Cordon']),
    req('fechaEnvioMuestra', 'Fecha de envío de la muestra', ['Fecha de envío de la muestra']),
    req('fechaResultado', 'Fecha de resultado', ['Fecha de resultado']),
    req('valorTsh', 'Valor TSH', ['Valor TSH']),
    optionalReq('t4Libre', 'T4 libre', ['T4 libre']),
    req('laboratorio', 'Laboratorio donde se envía para lectura de muestra', ['Laboratorio donde se envía para lectura de muestra']),
    opt('tratamiento', 'Tratamiento', ['Tratamiento'], ['SI', 'NO']),
    opt('pediatra', 'Pediatra', ['Pediatra'], ['SI', 'NO']),
    opt('endocrinologo', 'Endocrinólogo', ['Endocrinólogo'], ['SI', 'NO']),
    req('tamizajeVisual', 'Tamizaje visual', ['Tamizaje visual']),
    opt('resultadoTamizajeVisual', 'Resultado tamizaje visual', ['Resultado tamizaje visual'], ['NORMAL', 'ANORMAL']),
    req('tamizajeAuditivo', 'Tamizaje auditivo', ['Tamizaje auditivo']),
    opt('resultadoTamizajeAuditivo', 'Resultado tamizaje auditivo', ['Resultado tamizaje auditivo'], ['NORMAL', 'ANORMAL']),
    opt('tamizajeCardiopatias', 'Tamizaje cardiopatías congénitas', ['Tamizaje cardiopatías congénitas'], ['SI', 'NO']),
    optionalReq('resultadoCardiopatiasPreductal', 'Resultado de cardiopatías congénitas Preductal %', ['Preductal']),
    optionalReq('resultadoCardiopatiasPosductal', 'Resultado de cardiopatías congénitas Posductal %', ['Posductal']),
    opt('vacunaHB', 'Vacunas HB', ['Vacunas HB'], ['SI', 'NO']),
    opt('vacunaBCG', 'Vacunas BCG', ['Vacunas BCG'], ['SI', 'NO']),
  ],
};

const PRIMERA_INFANCIA_TEMPLATE: TemplateSpec = {
  sheetNames: ['Nominal Valoracion Integral'],
  columns: [
    req('mesReportado', 'Mes reportado', ['MES REPORTADO']),
    req('institucion', 'Institución/Prestadora', ['INSTITUCIÓN /PRESTADORA']),
    req('totalInasistentes', 'Total inasistentes en el mes reportado', ['TOTAL INASISTENTES EN EL MES REPORTADO']),
    opt('nuevoPrograma', 'Nuevo en el programa', ['NUEVO EN EL PROGRAMA'], ['Si', 'No']),
    req('nombres', 'Nombres y apellidos del menor', ['NOMBRES Y APELLIDOS DEL MENOR']),
    req('fechaNacimiento', 'Fecha de nacimiento', ['FECHA DE NACIMIENTO']),
    opt('registroCivil', 'Registro civil', ['REGISTRO CIVIL'], ['SI', 'NO']),
    req('identificacion', 'No identificación', ['No IDENTIFICACIÓN']),
    req('edadMeses', 'Edad en meses', ['EDAD EN MESES']),
    opt('poblacion', 'Población', ['POBLACIÓN'], ['ROM', 'Indigena', 'Afro', 'Desplazado', 'Migrante', 'Ninguno']),
    opt('eapb', 'EAPB', ['EAPB'], EAPB_SUBSIDIADAS),
    req('madreCuidador', 'Nombre de la madre o cuidador', ['NOMBRE DE LA MADRE O CUIDADOR']),
    req('direccionResidencia', 'Dirección de residencia', ['DIRECCIÓN DE RESIDENCIA']),
    req('numeroContacto', 'Número de contacto', ['NÚMERO DE CONTACTO']),
    opt('tipoControl', 'Tipo de control', ['TIPO DE CONTROL'], ['Primera vez', 'Control', 'Inasistente']),
    opt('profesional', 'Profesional que realiza la atención', ['PROFESIONAL QUE REALIZA LA ATENCIÓN'], ['Mèdico', 'Enfermera', 'Pediatra']),
    opt('esquemaVacunacion', 'Esquema de vacunación completo para la edad', ['ESQUEMA DE VACUNACIÓN COMPLETO PARA LA EDAD'], ['SI', 'NO']),
    opt('alteracionesCrecimiento', 'Alteraciones en el crecimiento', ['ALTERACIONES EN EL CRECIMIENTO'], ['Sin alteraciones', 'Riesgo de DNT', 'DNT Aguda', 'DNT Cronica', 'Soprepeso', 'Obesidad']),
    opt('alteracionesDesarrollo', 'Alteraciones en el desarrollo', ['ALTERACIONES EN EL DESARROLLO'], ['Sin alteraciones', 'Riesgo en el desarrollo', 'Sospecha de riesgo en el desarrollo']),
    opt('problemasAlimentacion', 'Problemas en la alimentación', ['PROBLEMAS EN LA ALIMENTACIÓN'], ['Lactancia materna', 'Alimentacion Complementaria', 'Alimentacion']),
    opt('fortificacionCasera', 'Fortificación casera con micronutrientes en polvo', ['FORTIFICACIÓN CASERA CON MICRONUTRIENTES EN POLVO'], ['No aplica', '6- 8 meses', '12-18 meses', '18-23 meses']),
    opt('suplementacion', 'Suplementación con micronutrientes', ['SUPLEMENTACIÓN CON MICRONUTRIENTES'], ['Primera', 'Segunda', 'No aplica']),
    opt('desparasitacion', 'Desparasitación intestinal a partir del año de edad', ['DESPARASITACIÓN INTESTINAL A PARTIR DEL AÑO DE EDAD'], ['Primera', 'Segunda', 'No aplica']),
    opt('discapacidad', 'Discapacidad', ['DISCAPACIDAD'], ['No aplica', 'Sensorial visual', 'Sensorial visual auditiva', 'cognitiva', 'fisica', 'Mùltiple']),
    opt('tamizajeVisual', 'Tamizaje visual', ['TAMIZAJE VISUAL'], ['No aplica', 'Normal', 'Con alteracion']),
    opt('tamizajeAuditivo', 'Tamizaje auditivo', ['TAMIZAJE AUDITIVO'], ['No aplica', 'Normal', 'Con alteracion']),
    opt('signosMaltrato', 'Signos de maltrato', ['SIGNOS DE MALTRATO'], ['No aplica', 'Fisico', 'Psicologico', 'Sexual', 'Abandono']),
    opt('barnizFluor', 'Aplicación de barniz y flúor', ['APLICACIÓN DE BARNIZ Y FLÙOR'], ['NO APLICA', 'SI', 'NO', 'PENDIENTE']),
    opt('profilaxis', 'Profilaxis y remoción de placa bacteriana', ['PROFILAXIS Y REMOCIÓN DE PLACA BACTERIANA'], ['No aplica', 'Si', 'No', 'Pendiente']),
    opt('sellantes', 'Aplicación de sellantes', ['APLICACIÓN DE SELLANTES'], ['No aplica', 'SI', 'No']),
  ],
};

const INFANCIA_TEMPLATE: TemplateSpec = {
  sheetNames: ['Nominal Valoracion Integral'],
  columns: [
    req('mesReportado', 'Mes reportado', ['MES REPORTADO']),
    req('institucion', 'Institución/Prestadora', ['INSTITUCION /PRESTADORA']),
    req('nombres', 'Nombres y apellidos', ['NOMBRES Y APELLIDOS']),
    req('fechaNacimiento', 'Fecha de nacimiento', ['FECHA DE NACIMIENTO']),
    opt('registroCivil', 'Registro civil', ['REGISTRO CIVIL'], ['SI', 'NO']),
    req('identificacion', 'No identificación', ['No IDENTIFICACION']),
    req('edadMeses', 'Edad en meses', ['EDAD EN MESES']),
    opt('poblacion', 'Población', ['POBLACION'], ['ROM', 'Indigena', 'Afro', 'Desplazado', 'Migrante', 'Ninguno']),
    opt('eapb', 'EAPB', ['EAPB'], ['EMSSANAR', 'SANITAS', 'NUEVA EPS', 'MALLAMAS', 'ASMETSALUD', 'OTRO']),
    req('madreCuidador', 'Nombre de la madre o cuidador', ['NOMBRE DE LA MADRE O CUIDADOR']),
    req('direccionResidencia', 'Dirección de residencia', ['DIRECCION DE RESIDENCIA']),
    req('numeroContacto', 'Número de contacto', ['NUMERO DE CONTACTO']),
    opt('tipoControl', 'Tipo de control', ['TIPO DE CONTROL'], ['Primera vez', 'Control', 'Inasistente']),
    opt('profesional', 'Profesional que realiza la atención', ['PROFESIONAL QUE REALIZA LA ATENCION'], ['Mèdico', 'Enfermera', 'Odontologo']),
    opt('alteracionesCrecimiento', 'Alteraciones en el crecimiento', ['ALTERACIONES EN EL CRECIMIENTO'], ['Sin alteraciones', 'Riesgo de DNT', 'DNT Aguda', 'DNT Cronica', 'Soprepeso', 'Obesidad'], false),
    opt('alteracionesDesarrollo', 'Alteraciones en el desarrollo', ['ALTERACIONES EN EL DESARROLLO'], ['Sin alteraciones', 'Riesgo en el desarrollo', 'Sospecha de riesgo en el desarrollo'], false),
    opt('tamizajeAnemia', 'Tamizaje para anemia, hemoglobina y hematocrito', ['TAMIZAJE PARA ANEMIA'], ['No aplica', 'Si', 'No']),
    opt('barnizFluor', 'Aplicación de barniz de flúor', ['APLICACION DE BARNIZ DE FLÙOR'], ['No aplica', 'SI', 'No']),
    opt('profilaxis', 'Profilaxis y remoción de placa bacteriana', ['PROFILAXIS Y REMOCION DE PLACA BACTERIANA'], ['No aplica', 'Si', 'No']),
    opt('sellantes', 'Aplicación de sellantes', ['APLICACION DE SELLANTES'], ['No aplica', 'Si', 'No']),
    opt('vacunacion', 'Vacunación según esquema', ['VACUNACION'], ['Si', 'No']),
  ],
};

const EDA_TEMPLATE: TemplateSpec = {
  sheetNames: ['EDA'],
  columns: [
    req('mesReporte', 'Mes de reporte', ['Mes de reporte']),
    req('fechaIngreso', 'Fecha ingreso', ['Fecha ingreso']),
    req('horaIngreso', 'Hora de ingreso sala EDA', ['Hora de ingreso sala EDA']),
    req('horaEgreso', 'Hora de egreso sala EDA', ['Hora de egreso sala EDA']),
    req('nombres', 'Nombres y apellidos', ['Nombres y apellidos']),
    opt('tipoIdentificacion', 'Tipo identificación', ['Tipo Identificación'], TIPO_IDENTIFICACION),
    req('numeroIdentificacion', 'Número identificación', ['Numero identificación']),
    req('fechaNacimiento', 'Fecha nacimiento', ['Fecha nacimiento']),
    req('edadMeses', 'Edad en meses', ['Edad en meses']),
    opt('sexo', 'Sexo', ['Sexo'], ['Femenino', 'Masculino']),
    req('direccionResidencia', 'Dirección de residencia', ['Direccion  de residencia', 'Direccion de residencia']),
    opt('municipioResidencia', 'Municipio residencia', ['Municipio residencia'], MUNICIPIOS_NARINO),
    req('telefono', 'Teléfono fijo y celular', ['Teléfono fijo y celular']),
    opt('eapb', 'EAPB', ['EAPB'], EAPB_SUBSIDIADAS),
    req('diagnosticoIngreso', 'Diagnóstico ingreso en código CIE-10', ['Diagnostico ingreso en código CIE-10']),
    opt('casoResuelto', '¿Caso resuelto en SALAS EDA?', ['Caso resuelto en SALAS EDA'], ['SI', 'NO']),
    opt('destinoEgreso', 'Destino al egreso', ['Destino al egreso'], ['Domicilio o casa', 'Hospitalizacion en la misma institucion', 'Remitido a nivel superior de complejidad']),
    opt('educacionCuidador', 'Educación al cuidador', ['Educacion al cuidador'], ['SI', 'NO']),
    opt('controlSetentaYDosHoras', '¿Se realiza control a las 72?', ['Se realiza control a las 72'], ['SI', 'NO']),
    opt('resultadoControl', 'Resultado de control a las 72 horas', ['Resultado de control a las 72 horas'], ['1. mejorò su estado de salud', '2.Sigue en igual estado de salud', '3.Empeorò su estdo de salud'], false),
  ],
};

const ERA_TEMPLATE: TemplateSpec = {
  sheetNames: ['Base atención Sala ERA', 'Base atencion Sala ERA'],
  maxDataRow: 1204,
  columns: [
    req('numero', 'N', ['n']),
    req('fechaIngreso', 'Fecha ingreso', ['1. Fecha ingreso']),
    opt('trimestre', 'Trimestre', ['2.Trimestre'], ['I', 'II', 'III', 'IV']),
    req('nombres', 'Nombres', ['3. Nombres']),
    req('apellidos', 'Apellidos', ['4. Apellidos']),
    opt('tipoIdentificacion', 'Tipo de identificación', ['5. Tipo de identificación'], [
      'AS:Adulto sin identificación', 'CC:Cédula de ciudadanía', 'CE:Cédula de extranjería',
      'MS:Menor sin identificar', 'NUIP: Número único de identificación personal',
      'PEP:Permiso especial de permanencia', 'PS:Pasaporte', 'RC:Registro Civil', 'TI:Tarjeta de identidad',
    ]),
    req('numeroIdentificacion', 'Número de identificación', ['6. Número de identificación']),
    req('edad', 'Edad', ['7.Edad']),
    opt('sexo', 'Sexo', ['8.Sexo'], ['Femenino', 'Masculino', 'Indeterminado']),
    opt('pertenenciaEtnica', 'Pertenencia étnica', ['9. Pertenencia étnica'], [
      'Negro, mulato, afrocolombiano', 'Palenquero', 'Rom (Gitano)', 'Indígena', 'Raizal', 'Otro', 'Ninguno',
    ]),
    optionalReq('puebloIndigena', 'Pueblo indígena', ['10. Pueblo indígena']),
    opt('grupoPoblacional', 'Grupo poblacional', ['11. Grupo poblacional'], GRUPO_POBLACIONAL_ERA_UAIC),
    opt('departamentoResidencia', 'Departamento de residencia', ['12.Departamento de residencia'], DEPARTAMENTOS_CO),
    opt('municipioResidencia', 'Municipio de residencia', ['13. Municipio de residencia'], MUNICIPIOS_NARINO),
    req('direccionResidencia', 'Dirección de residencia', ['14.Dirección  de residencia', '14.Dirección de residencia']),
    opt('areaGeografica', 'Área geográfica de residencia', ['15. Área geográfica de residencia'], ['Cabecera municipal', 'Área metropolitana', 'Centro Poblado', 'Rural disperso']),
    optionalReq('localidadComuna', 'Localidad/Comuna', ['16. Localidad/Comuna']),
    optionalReq('barrioCorregimiento', 'Barrio/Corregimiento', ['17. Barrio /Corregimiento']),
    opt('regimenAfiliacion', 'Régimen de Afiliación al SGSSS', ['18.Régimen de Afiliación al SGSSS'], REGIMEN_SGSSS),
    opt('eapb', 'EAPB', ['19.EAPB'], EAPB_NACIONAL),
    req('diagnosticoIngreso', 'Diagnóstico ingreso en código CIE-10', ['20. Diagnostico ingreso en código CIE-10']),
    opt('casoResuelto', '¿Caso resuelto en SALAS ERA?', ['21. ¿Caso resuelto en SALAS ERA?'], ['SI', 'NO']),
    req('horaIngreso', 'Hora de ingreso sala ERA', ['22. Hora de ingreso sala ERA']),
    req('horaEgreso', 'Hora de egreso sala ERA', ['23. Hora de egreso sala ERA en formato 24 horas']),
    opt('destinoEgreso', 'Destino al egreso', ['24. Destino al egreso'], [
      'Domicilio o casa', 'Hospitalización en la misma institución',
      'Ingreso a UCI/UCIM en la misma institución', 'Ingreso a una insitución de mayor nivel complejidad',
    ]),
    req('fechaEgreso', 'Fecha de egreso', ['25.Fecha de egreso']),
    opt('seguimiento48h', '¿Se realizó seguimiento a las 48 horas del egreso?', ['26. ¿Se realizó seguimiento a las 48 horas del egreso?'], ['SI', 'NO']),
    optionalReq('comoSeguimiento48h', 'Cómo se hizo el seguimiento al egreso de las 48 h', ['27. Cómo se hizo el seguimiento al egreso de las 48 h']),
    optionalReq('resultadoSeguimiento48h', 'Resultado de seguimiento a las 48 horas', ['28.Resultado de seguimiento a las 48 horas']),
    opt('seguimiento7dias', '¿Se realizó seguimiento a los 7 días?', ['29. ¿Se realizó seguimiento a los 7 días?'], ['SI', 'NO']),
    optionalReq('resultadoSeguimiento7dias', 'Resultado del seguimiento a los 7 días', ['30. Resultado del seguimiento a los 7 días']),
    opt('condicionFinal', 'Condición Final', ['31. Condicion Final'], ['Vivo', 'Muerto', 'Sin información']),
    opt('factoresRiesgo', 'Factores de riesgo o condiciones identificadas en la sala ERA', ['32.Factores de riesgo o condiciones identificadas en la sala ERA'], [
      'Acceso limitado a servicios de salud', 'Baja red de apoyo social', 'Contaminación ambiental',
      'Contaminación ambiental- acceso limitado a servicios de salud',
      'Contaminación ambiental- Esquema vacunal no iniciado o incompleto',
      'Esquema vacunal no iniciado o incompleto', 'Esquema vacunal no iniciado o incompleto- Prematurez',
      'Esquema vacunal no iniciado o incompleto- Prematurez- No lactancia Materna', 'Negligencia',
      'No acceso agua segura', 'No lactancia materna', 'Factores socioculturales, creencias y prácticas', 'Ninguno',
    ]),
    opt('comorbilidades', 'Comorbilidades', ['33.Comorbilidades'], [
      'Afecciones genitourinarias', 'Afecciones metabólicas', 'Aleraciones cardiovasculares',
      'Alteraciones hematológicas', 'Asma', 'Cardiopatías congénitas', 'Desnutrición aguda',
      'Desnutrición crónica', 'Displasia broncopulmonar', 'Fibrosis pulmonar',
      'Inmunodeficiencias primarias', 'Malformación tracto gastrointestinal', 'Múltiples',
      'Neoplasia', 'Ninguna', 'Prematurez- Bajo peso al nacer', 'VIH', 'Otra',
    ]),
    opt('departamentoNotificacion', 'Departamento de notificación IPS o UPGD', ['34. Departamento de notificación IPS o UPGD'], DEPARTAMENTOS_CO),
    opt('municipioNotificacion', 'Municipio de notificación IPS o UPGD', ['35.Municipio de notificación IPS o UPGD'], MUNICIPIOS_NARINO),
    req('nombrePrestador', 'Nombre del prestador de servicios de salud o UPGD', ['36.Nombre del prestador de servicios de salud o UPGD']),
    opt('modalidadSalaERA', 'Modalidad Sala ERA', ['37.Modalidad Sala ERA'], ['Temporal', 'Permanente']),
    opt('tipoPrestador', 'Tipo prestador', ['38.Tipo prestador'], ['Pública', 'Privada']),
    req('direccionIPS', 'Dirección IPS o UPGD', ['39.Dirección IPS o UPGD']),
    req('telefonoIPS', 'Teléfono IPS o UPGD', ['40.Teléfono IPS o UPGD']),
    optionalReq('observaciones', 'Observaciones', ['41.Observaciones']),
  ],
};

const UAIC_TEMPLATE: TemplateSpec = {
  sheetNames: ['Casos individuales'],
  maxDataRow: 91,
  columns: [
    req('fechaIngreso', 'Fecha ingreso', ['1. Fecha ingreso']),
    req('nombres', 'Nombres y apellidos', ['2. Nombres y apellidos']),
    opt('tipoIdentificacion', 'Tipo Identificación', ['3. Tipo Identificación'], TIPO_IDENTIFICACION),
    req('numeroIdentificacion', 'Número identificación', ['4. Número identificación']),
    req('fechaNacimiento', 'Fecha nacimiento', ['5. Fecha nacimiento']),
    req('edad', 'Edad', ['6.Edad']),
    opt('sexo', 'Sexo', ['7.Sexo'], ['Femenino', 'Masculino', 'Indeterminado']),
    req('direccionResidencia', 'Dirección de residencia', ['8.Dirección  de residencia', '8.Dirección de residencia']),
    opt('departamentoResidencia', 'Departamento de residencia', ['9. Departamento de residencia'], DEPARTAMENTOS_CO),
    opt('municipioResidencia', 'Municipio residencia', ['10. Municipio residencia'], MUNICIPIOS_NARINO),
    req('telefono', 'Teléfono fijo y celular', ['11.Teléfono fijo y celular']),
    opt('poblacion', 'Población', ['12. Población'], GRUPO_POBLACIONAL_ERA_UAIC),
    opt('area', 'Área', ['13. Área'], ['1. Cabecera Municipal', '2. Centro Poblado', '3. Rural Disperso']),
    opt('regimenAfiliacion', 'Régimen de Afiliación al SSSS', ['14.Régimen de Afiliación al SSSS'], REGIMEN_SGSSS),
    opt('eapb', 'EAPB', ['15.EAPB'], EAPB_NACIONAL),
    opt('diagnosticoIngreso', 'Diagnóstico ingreso (IRA o EDA)', ['16. Diagnóstico ingreso'], ['IRA', 'EDA']),
    opt('casoResuelto', '¿Caso resuelto en la UAIC?', ['17. ¿Caso resuelto en la UAIC?'], ['SI', 'NO']),
    req('horaIngreso', 'Hora de ingreso UAIC', ['18. Hora de ingreso UAIC']),
    req('horaEgreso', 'Hora de egreso UAIC en formato 24 horas', ['19. Hora de egreso UAIC en formato 24 horas']),
    opt('destinoEgreso', 'Destino al egreso', ['20. Destino al egreso'], [
      '1. Domicilio o casa', '2. Hospitalizacion en la misma institucion', '3. Remitido a nivel superior de complejidad',
    ]),
    req('fechaEgreso', 'Fecha de egreso', ['21.Fecha de egreso']),
    opt('seguimiento48h', '¿Se realizó seguimiento a las 48 horas del egreso?', ['22. ¿Se realizó seguimiento a las 48 horas del egreso?'], ['SI', 'NO']),
    optionalReq('comoSeguimiento48h', 'Cómo se hizo el seguimiento al egreso de las 48 h', ['23. Cómo se hizo el seguimiento al egreso de las 48 h']),
    optionalReq('resultadoSeguimiento48h', 'Resultado de seguimiento a las 48 horas', ['24.Resultado de seguimiento a las 48 horas']),
    optionalReq('empeoraSeguimiento', 'Si el estado de salud empeora al seguimiento, indique qué pasó', ['25. Si el estado de salud empeora']),
    opt('seguimiento7dias', '¿Se realizó seguimiento a los 7 días?', ['26. ¿Se realizó seguimiento a los 7 días?'], ['SI', 'NO']),
    optionalReq('resultadoSeguimiento7dias', 'Resultado del seguimiento a los 7 días', ['27. Resultado del seguimiento a los 7 días']),
    opt('vivoMuerto', 'Vivo o muerto', ['28. Vivo o muerto'], ['Vivo', 'Muerto']),
    opt('modalidad', 'Modalidad', ['29. Modalidad'], ['UAIC', 'UROC', 'AIEPI', 'Extramural', 'UAIRA']),
    req('nombrePrestador', 'Nombre del prestador', ['30 Nombre del prestador']),
    opt('departamentoNotificacion', 'Departamento notificación UPGD', ['31 Departamento notificación UPGD'], DEPARTAMENTOS_CO),
    opt('municipioNotificacion', 'Municipio notificación UPGD', ['32 Municipio notificación UPGD'], MUNICIPIOS_NARINO),
  ],
};

const TEMPLATES: Record<string, TemplateSpec> = {
  recien_nacido: RECIEN_NACIDO_TEMPLATE,
  primera_infancia: PRIMERA_INFANCIA_TEMPLATE,
  infancia: INFANCIA_TEMPLATE,
  eda: EDA_TEMPLATE,
  era: ERA_TEMPLATE,
  uaic: UAIC_TEMPLATE,
};

@Injectable()
export class ExcelUploadService {
  validateModuleUpload(moduleKey: string, file?: UploadedExcelFile): ValidationResult {
    this.ensureExcelFile(file);

    const template = TEMPLATES[moduleKey];
    if (!template) {
      return {
        moduleKey,
        fileName: file.originalname,
        message:
          'Archivo recibido. La validacion detallada de este modulo aun no esta configurada.',
        totalRows: 0,
        validRows: 0,
        invalidRows: 0,
        errors: [],
      };
    }

    return this.validateTemplate(moduleKey, template, file);
  }

  private validateTemplate(
    moduleKey: string,
    template: TemplateSpec,
    file: UploadedExcelFile,
  ): ValidationResult {
    const workbook = XLSX.read(file.buffer, { type: 'buffer', cellDates: true });

    const sheetName = template.sheetNames.find((name) =>
      workbook.SheetNames.includes(name),
    );

    if (!sheetName) {
      throw new BadRequestException({
        message: `El archivo debe tener una hoja llamada "${template.sheetNames[0]}".`,
        availableSheets: workbook.SheetNames,
      });
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = this.sheetToGrid(sheet);
    const headerRowIndex = this.findHeaderRow(rows, template);
    const { matches, missing } = this.matchColumns(rows[headerRowIndex] ?? [], template);

    this.logDetectedColumns({
      fileName: file.originalname,
      sheetName,
      headerRowIndex,
      matches,
      missing,
    });

    if (missing.length > 0) {
      throw new BadRequestException({
        message: 'No se encontraron todas las columnas requeridas.',
        missingHeaders: missing.map((column) => column.label),
      });
    }

    const dataStartIndex = headerRowIndex + 1;
    const dataEndIndex =
      template.maxDataRow != null ? Math.min(template.maxDataRow, rows.length - 1) : rows.length - 1;

    const validations: RowValidation[] = [];
    for (let rowIndex = dataStartIndex; rowIndex <= dataEndIndex; rowIndex += 1) {
      const row = rows[rowIndex] ?? [];
      const validation = this.validateRow(row, rowIndex, matches);
      if (this.hasMeaningfulData(validation.data)) {
        validations.push(validation);
      }
    }

    const invalidRows = validations.filter((row) => row.errors.length > 0);

    return {
      moduleKey,
      fileName: file.originalname,
      sheetName,
      totalRows: validations.length,
      validRows: validations.length - invalidRows.length,
      invalidRows: invalidRows.length,
      errors: invalidRows.slice(0, 30).map((row) => ({
        rowNumber: row.rowNumber,
        errors: row.errors,
      })),
    };
  }

  private ensureExcelFile(file?: UploadedExcelFile): asserts file is UploadedExcelFile {
    if (!file) {
      throw new BadRequestException('Debe adjuntar un archivo Excel.');
    }

    const name = file.originalname.toLowerCase();
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      throw new BadRequestException('El archivo debe ser .xlsx o .xls.');
    }
  }

  private sheetToGrid(sheet: XLSX.WorkSheet): string[][] {
    const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1:A1');
    const rows: string[][] = [];

    for (let row = range.s.r; row <= range.e.r; row += 1) {
      const values: string[] = [];
      for (let col = range.s.c; col <= range.e.c; col += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        values[col] = this.cellToText(sheet[address]);
      }
      rows[row] = values;
    }

    return rows;
  }

  private cellToText(cell?: XLSX.CellObject): string {
    if (!cell) return '';
    return XLSX.utils.format_cell(cell).trim();
  }

  private findHeaderRow(rows: string[][], template: TemplateSpec): number {
    const searchRows = template.headerSearchRows ?? 15;
    let best = { index: -1, score: 0 };

    rows.slice(0, searchRows).forEach((row, index) => {
      const normalizedCells = row.map((cell) => this.normalize(cell));
      const score = template.columns.filter((column) =>
        normalizedCells.some((cell) =>
          column.aliases.some((alias) => this.aliasMatchesCell(alias, cell)),
        ),
      ).length;

      if (score > best.score) {
        best = { index, score };
      }
    });

    const minMatches = Math.max(3, Math.ceil(template.columns.length * 0.3));
    if (best.score < minMatches) {
      throw new BadRequestException(
        'No fue posible identificar la fila de encabezados del formato.',
      );
    }

    return best.index;
  }

  private matchColumns(
    headerRow: string[],
    template: TemplateSpec,
  ): { matches: ColumnMatch[]; missing: ColumnSpec[] } {
    const normalizedCells = headerRow.map((cell) => this.normalize(cell));
    const consumed = new Set<number>();
    const matches: ColumnMatch[] = [];
    const missing: ColumnSpec[] = [];

    const maxAliasLength = (column: ColumnSpec) =>
      Math.max(...column.aliases.map((alias) => this.normalize(alias).length));

    const orderedColumns = [...template.columns].sort(
      (a, b) => maxAliasLength(b) - maxAliasLength(a),
    );

    const resolvedIndexByKey = new Map<string, number>();

    for (const column of orderedColumns) {
      const index = normalizedCells.findIndex(
        (cell, cellIndex) =>
          !consumed.has(cellIndex) &&
          column.aliases.some((alias) => this.aliasMatchesCell(alias, cell)),
      );

      if (index === -1) {
        missing.push(column);
      } else {
        consumed.add(index);
        resolvedIndexByKey.set(column.key, index);
      }
    }

    for (const column of template.columns) {
      const index = resolvedIndexByKey.get(column.key);
      if (index !== undefined) {
        matches.push({ ...column, index });
      }
    }

    return { matches, missing };
  }

  private aliasMatchesCell(alias: string, normalizedCell: string): boolean {
    const normalizedAlias = this.normalize(alias);
    if (!normalizedAlias) return false;
    return normalizedCell.includes(normalizedAlias);
  }

  private validateRow(
    row: string[],
    rowIndex: number,
    columns: ColumnMatch[],
  ): RowValidation {
    const data: Record<string, string> = {};
    const errors: string[] = [];

    for (const column of columns) {
      const value = (row[column.index] ?? '').trim();
      data[column.key] = value;

      if (!value) {
        if (column.required !== false) {
          errors.push(`Falta diligenciar "${column.label}".`);
        }
        continue;
      }

      if (column.options && !this.isOptionMatch(value, column.options)) {
        errors.push(
          `El valor "${value}" no es válido para "${column.label}". Opciones: ${column.options.join(', ')}.`,
        );
      }
    }

    return {
      rowNumber: rowIndex + 1,
      data,
      errors,
    };
  }

  private isOptionMatch(value: string, options: string[]): boolean {
    const normalizedValue = this.normalize(value);
    return options.some((option) => {
      const normalizedOption = this.normalize(option);
      return (
        normalizedOption === normalizedValue ||
        normalizedValue.includes(normalizedOption) ||
        normalizedOption.includes(normalizedValue)
      );
    });
  }

  private hasMeaningfulData(data: Record<string, string>) {
    return Object.values(data).some((value) => value.trim().length > 0);
  }

  private logDetectedColumns({
    fileName,
    sheetName,
    headerRowIndex,
    matches,
    missing,
  }: {
    fileName: string;
    sheetName: string;
    headerRowIndex: number;
    matches: ColumnMatch[];
    missing: ColumnSpec[];
  }) {
    console.log(
      JSON.stringify(
        {
          event: 'excel_columns_detected',
          fileName,
          sheetName,
          headerRow: headerRowIndex + 1,
          foundColumns: matches.map((column) => ({
            excelColumn: XLSX.utils.encode_col(column.index),
            key: column.key,
            label: column.label,
          })),
          missingHeaders: missing.map((column) => column.label),
        },
        null,
        2,
      ),
    );
  }

  private normalize(value: string) {
    return value
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }
}
