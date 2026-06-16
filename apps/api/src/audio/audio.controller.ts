import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AudioService } from './audio.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { UpdateAudioDto } from './dto/update-audio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Audio')
@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './public/uploads/audio',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
      }
    })
  }))
  create(@Body() createAudioDto: CreateAudioDto, @UploadedFile() file: Express.Multer.File) {
    if (file) {
      // Create the URL to access the file statically
      createAudioDto.audioUrl = `${process.env.API_URL || 'http://localhost:3000'}/public/uploads/audio/${file.filename}`;
    } else if (!createAudioDto.audioUrl) {
      throw new BadRequestException('Either a file or audioUrl must be provided');
    }
    return this.audioService.create(createAudioDto);
  }

  @Get()
  findAll() {
    return this.audioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.audioService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAudioDto: UpdateAudioDto) {
    return this.audioService.update(id, updateAudioDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.audioService.remove(id);
  }
}
