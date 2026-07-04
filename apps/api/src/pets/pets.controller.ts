import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PetsService } from './pets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResourceLimitGuard, ResourceType } from '../common/guards/resource-limit.guard';

@ApiTags('Pets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @UseGuards(ResourceLimitGuard)
  @ResourceType('pets')
  @Post()
  @ApiOperation({ summary: 'Create a new pet profile' })
  createPet(@CurrentUser() user: any, @Body() body: any) {
    return this.petsService.createPet(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all pets' })
  findAllPets(@CurrentUser() user: any) {
    return this.petsService.findAllPets(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a pet profile' })
  getPet(@Param('id') id: string, @CurrentUser() user: any) {
    return this.petsService.getPet(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a pet profile' })
  updatePet(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.updatePet(id, user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a pet profile' })
  removePet(@Param('id') id: string, @CurrentUser() user: any) {
    return this.petsService.removePet(id, user.id);
  }

  // --- Sub-resources ---

  @Post(':id/vets')
  @ApiOperation({ summary: 'Add a veterinarian to a pet' })
  addVet(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.addVet(id, user.id, body);
  }

  @Post(':id/clinics')
  @ApiOperation({ summary: 'Add an emergency clinic to a pet' })
  addClinic(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.addClinic(id, user.id, body);
  }

  @Post(':id/vaccinations')
  @ApiOperation({ summary: 'Add a vaccination to a pet' })
  addVaccination(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.addVaccination(id, user.id, body);
  }

  @Post(':id/medications')
  @ApiOperation({ summary: 'Add a medication to a pet' })
  addMedication(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.addMedication(id, user.id, body);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note to a pet' })
  addNote(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.addNote(id, user.id, body);
  }

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Add a task to a pet' })
  addTask(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.addTask(id, user.id, body);
  }

  @Patch(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Update a task for a pet' })
  updateTask(@Param('id') id: string, @Param('taskId') taskId: string, @CurrentUser() user: any, @Body() body: any) {
    return this.petsService.updateTask(taskId, id, user.id, body);
  }

  @Delete(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Delete a task for a pet' })
  removeTask(@Param('id') id: string, @Param('taskId') taskId: string, @CurrentUser() user: any) {
    return this.petsService.removeTask(taskId, id, user.id);
  }
}
