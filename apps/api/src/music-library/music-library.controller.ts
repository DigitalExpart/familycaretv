import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MusicLibraryService } from './music-library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Music Library')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('music')
export class MusicLibraryController {
  constructor(private readonly musicService: MusicLibraryService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all music categories with tracks' })
  getCategories() {
    return this.musicService.getCategories();
  }

  @Get()
  @ApiOperation({ summary: 'Get all music tracks, optionally filtered by language' })
  getAllTracks(@Query('language') language?: string) {
    return this.musicService.getAllTracks(language);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('categories')
  @ApiOperation({ summary: 'Add a music category (Admin only)' })
  addCategory(@Body() body: any) {
    return this.musicService.addCategory(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Add a music track (Admin only)' })
  addTrack(@Body() body: any) {
    return this.musicService.addTrack(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a music track (Admin only)' })
  removeTrack(@Param('id') id: string) {
    return this.musicService.removeTrack(id);
  }
}
