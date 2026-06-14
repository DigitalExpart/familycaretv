import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Doctors')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a doctor for a patient' })
  create(@CurrentUser() user: any, @Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(user.id, createDoctorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all doctors for a specific patient' })
  @ApiQuery({ name: 'patientId', required: true })
  findAll(@CurrentUser() user: any, @Query('patientId') patientId: string) {
    return this.doctorsService.findAll(user.id, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific doctor' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.doctorsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a doctor' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(id, user.id, updateDoctorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a doctor' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.doctorsService.remove(id, user.id);
  }
}
