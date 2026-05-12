import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return (this.prisma as any).modules.findMany({
      where: { enabled: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
