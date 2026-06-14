import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BibleVersesService } from './bible-verses.service';
import { CreateBibleVerseDto } from './dto/create-bible-verse.dto';
import { UpdateBibleVerseDto } from './dto/update-bible-verse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Bible Verses')
@Controller('bible-verses')
export class BibleVersesController {
  constructor(private readonly bibleVersesService: BibleVersesService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createBibleVerseDto: CreateBibleVerseDto) {
    return this.bibleVersesService.create(createBibleVerseDto);
  }

  @Get()
  findAll() {
    return this.bibleVersesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bibleVersesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBibleVerseDto: UpdateBibleVerseDto) {
    return this.bibleVersesService.update(id, updateBibleVerseDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bibleVersesService.remove(id);
  }
}
