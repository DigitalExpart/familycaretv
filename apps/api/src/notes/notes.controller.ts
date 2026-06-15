import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly service: NotesService) {}
  @Post()
  @ApiOperation({ summary: 'Create a note for a patient' })
  create(@CurrentUser() user: any, @Body() dto: CreateNoteDto) {
    return this.service.create(user.id, dto);
  }
  @Get()
  @ApiOperation({ summary: 'Get all notes for a specific patient' })
  @ApiQuery({ name: 'patientId', required: true })
  findAll(@CurrentUser() user: any, @Query('patientId') patientId: string) {
    return this.service.findAll(user.id, patientId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateNoteDto) {
    return this.service.update(id, user.id, dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id);
  }

  // --- ADMIN ENDPOINTS ---

  @Post('admin/patient/:patientId')
  @ApiOperation({ summary: 'Create a note (Admin)' })
  adminCreate(@Param('patientId') patientId: string, @Body() dto: CreateNoteDto) {
    dto.patientId = patientId;
    return this.service.adminCreate(dto);
  }

  @Patch('admin/:id')
  @ApiOperation({ summary: 'Update a note (Admin)' })
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.service.adminUpdate(id, dto);
  }

  @Delete('admin/:id')
  @ApiOperation({ summary: 'Delete a note (Admin)' })
  adminRemove(@Param('id') id: string) {
    return this.service.adminRemove(id);
  }
}
