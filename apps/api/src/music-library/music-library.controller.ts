import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { MusicLibraryService } from './music-library.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
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
  getCategories(@CurrentUser() user: any) {
    const isAdmin = user?.role === Role.ADMIN;
    return this.musicService.getCategories(isAdmin);
  }

  @Get()
  @ApiOperation({ summary: 'Get all music tracks, optionally filtered by language and search' })
  getAllTracks(
    @CurrentUser() user: any,
    @Query('language') language?: string,
    @Query('search') search?: string
  ) {
    const isAdmin = user?.role === Role.ADMIN;
    return this.musicService.getAllTracks(language, isAdmin, search);
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
  @Put(':id')
  @ApiOperation({ summary: 'Update a music track (Admin only)' })
  updateTrack(@Param('id') id: string, @Body() body: any) {
    return this.musicService.updateTrack(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a music track (Admin only)' })
  removeTrack(@Param('id') id: string) {
    return this.musicService.removeTrack(id);
  }
}
