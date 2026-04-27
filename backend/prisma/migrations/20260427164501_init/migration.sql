-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SECRETARIO', 'IPS', 'AUDITOR');

-- CreateEnum
CREATE TYPE "EstadoImportacion" AS ENUM ('PROCESANDO', 'COMPLETADO', 'PARCIAL', 'FALLIDO');

-- CreateEnum
CREATE TYPE "Componente" AS ENUM ('RECIEN_NACIDO', 'HIPOTIROIDISMO_CONGENITO', 'VALORACION_INTEGRAL', 'SALAS_ERA', 'PLAN_IRA', 'EDA', 'GEOHELMINTIASIS', 'UNIDADES_UAIC', 'MIL_PRIMEROS_DIAS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMIN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportacionExcel" (
    "id" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "componente" "Componente" NOT NULL,
    "archivoOriginal" TEXT NOT NULL,
    "estado" "EstadoImportacion" NOT NULL DEFAULT 'PROCESANDO',
    "totalFilas" INTEGER NOT NULL DEFAULT 0,
    "filasValidas" INTEGER NOT NULL DEFAULT 0,
    "filasInvalidas" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportacionExcel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroComponente" (
    "id" TEXT NOT NULL,
    "importacionId" TEXT NOT NULL,
    "filaExcel" INTEGER NOT NULL,
    "datos" JSONB NOT NULL,
    "evidenciaUrl" TEXT,
    "errores" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistroComponente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReporteMensual" (
    "id" TEXT NOT NULL,
    "institucion" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "ano" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ENVIADO',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReporteMensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponenteEntry" (
    "id" TEXT NOT NULL,
    "reporteId" TEXT NOT NULL,
    "componente" "Componente" NOT NULL,
    "datos" JSONB NOT NULL,
    "evidenciaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ComponenteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "RegistroComponente_importacionId_idx" ON "RegistroComponente"("importacionId");

-- CreateIndex
CREATE INDEX "RegistroComponente_filaExcel_idx" ON "RegistroComponente"("filaExcel");

-- AddForeignKey
ALTER TABLE "ImportacionExcel" ADD CONSTRAINT "ImportacionExcel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistroComponente" ADD CONSTRAINT "RegistroComponente_importacionId_fkey" FOREIGN KEY ("importacionId") REFERENCES "ImportacionExcel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReporteMensual" ADD CONSTRAINT "ReporteMensual_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponenteEntry" ADD CONSTRAINT "ComponenteEntry_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "ReporteMensual"("id") ON DELETE CASCADE ON UPDATE CASCADE;
