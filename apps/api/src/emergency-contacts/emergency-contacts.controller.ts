import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EmergencyContactsService } from './emergency-contacts.service';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('EmergencyContacts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('emergency-contacts')
export class EmergencyContactsController {
  constructor(private readonly service: EmergencyContactsService) {}
  @Post()
  @ApiOperation({ summary: 'Create a contact for a patient' })
  create(@CurrentUser() user: any, @Body() dto: CreateEmergencyContactDto) {
    return this.service.create(user.id, dto);
  }
  @Get()
  @ApiOperation({ summary: 'Get all contacts for a specific patient' })
  @ApiQuery({ name: 'patientId', required: true })
  findAll(@CurrentUser() user: any, @Query('patientId') patientId: string) {
    return this.service.findAll(user.id, patientId);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific contact' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a contact' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateEmergencyContactDto) {
    return this.service.update(id, user.id, dto);
  }
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a contact' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id);
  }
}
