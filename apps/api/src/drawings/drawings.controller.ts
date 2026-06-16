import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DrawingsService } from './drawings.service';
import { CreateDrawingDto } from './dto/create-drawing.dto';
import { UpdateDrawingDto } from './dto/update-drawing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiQuery, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Drawings')
@Controller('drawings')
export class DrawingsController {
  constructor(private readonly drawingsService: DrawingsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/drawings',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(@Body() createDrawingDto: CreateDrawingDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      createDrawingDto.imageUrl = `${process.env.API_URL || 'http://localhost:3000'}/public/uploads/drawings/${file.filename}`;
    } else if (!createDrawingDto.imageUrl) {
      throw new BadRequestException('Either a file or imageUrl must be provided');
    }
    return this.drawingsService.create(createDrawingDto);
  }

  @Get()
  @ApiQuery({ name: 'patientId', required: false })
  findAll(@Query('patientId') patientId?: string) {
    return this.drawingsService.findAll(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drawingsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDrawingDto: UpdateDrawingDto) {
    return this.drawingsService.update(id, updateDrawingDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drawingsService.remove(id);
  }
}
