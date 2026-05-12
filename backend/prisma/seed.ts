import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const modules = [
  {
    key: 'recien_nacido',
    icon: 'baby_changing_station',
    title: 'Recién Nacido',
    description: 'Seguimiento Nominal de Recién Nacidos',
  },
  {
    key: 'hipotiroidismo_congenito',
    icon: 'inventory_2',
    title: 'Hipotiroidismo Congénito',
    description: 'Reporte de casos de hipotiroidismo congénito.',
  },
  {
    key: 'primera_infancia',
    icon: 'child_care',
    title: 'Primera Infancia',
    description: 'Registro nominal de valoración integral de primera infancia (0-5 años 11 meses y 29 días)',
  },
  {
    key: 'infancia',
    icon: 'family_restroom',
    title: 'Infancia',
    description: 'Registro nominal de valoración integral de infancia (6-11 años 11 meses y 29 días).',
  },
  {
    key: 'era',
    icon: 'medical_services',
    title: 'Sala ERA',
    description: 'Formato institucional para el registro de casos atendidos en sala ERA',
  },
  {
    key: 'eda',
    icon: 'water_drop',
    title: 'EDA',
    description: 'Formato de morbilidad Enfermedad Diarreica Aguda - EDA',
  },
  {
    key: 'uaic',
    icon: 'local_hospital',
    title: 'UAIC',
    description: 'Seguimiento a niños atendidos en las unidades de atención integral comunitaria.',
  },
];

async function main() {
  for (const mod of modules) {
    await (prisma as any).modules.upsert({
      where: { key: mod.key },
      update: {
        icon: mod.icon,
        title: mod.title,
        description: mod.description,
      },
      create: mod,
    });
  }
  console.log('Seed completado: 7 módulos insertados/actualizados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
