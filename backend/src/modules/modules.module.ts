import { Module } from '@nestjs/common';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';
import { ExcelUploadService } from './excel-upload.service';

@Module({
  controllers: [ModulesController],
  providers: [ModulesService, ExcelUploadService],
})
export class ModulesModule {}
