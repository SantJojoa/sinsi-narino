import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ModulesService } from './modules.service';
import { ExcelUploadService } from './excel-upload.service';

@Controller('modules')
export class ModulesController {
  constructor(
    private readonly modulesService: ModulesService,
    private readonly excelUploadService: ExcelUploadService,
  ) {}

  @Get()
  findAll() {
    return this.modulesService.findAll();
  }

  @Post(':key/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadModuleExcel(@Param('key') key: string, @UploadedFile() file: any) {
    return this.excelUploadService.validateModuleUpload(key, file);
  }
}
