import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  create(@CurrentUser() user: any, @Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(user.id, createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients for the current user' })
  findAll(@CurrentUser() user: any) {
    return this.patientsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific patient by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a patient by ID' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(id, user.id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a patient by ID' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.remove(id, user.id);
  }
}
