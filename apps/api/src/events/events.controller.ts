import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ResourceLimitGuard, ResourceType } from '../common/guards/resource-limit.guard';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get events for today' })
  @ApiQuery({ name: 'patientId', required: false })
  getToday(@CurrentUser() user: any, @Query('patientId') patientId?: string) {
    return this.service.getToday(user.id, patientId);
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiQuery({ name: 'patientId', required: false })
  getUpcoming(@CurrentUser() user: any, @Query('patientId') patientId?: string) {
    return this.service.getUpcoming(user.id, patientId);
  }

  @Get('ticker')
  @ApiOperation({ summary: 'Get events formatted for Roku ticker feed' })
  @ApiQuery({ name: 'patientId', required: false })
  getTicker(@CurrentUser() user: any, @Query('patientId') patientId?: string) {
    return this.service.getTicker(user.id, patientId);
  }

  @UseGuards(ResourceLimitGuard)
  @ResourceType('appointments')
  @Post()
  @ApiOperation({ summary: 'Create an event for a patient' })
  create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events for a specific patient' })
  @ApiQuery({ name: 'patientId', required: true })
  findAll(@CurrentUser() user: any, @Query('patientId') patientId: string) {
    return this.service.findAll(user.id, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific event' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an event' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateEventDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id);
  }

  // --- ADMIN ENDPOINTS ---

  @Post('admin/patient/:patientId')
  @ApiOperation({ summary: 'Create an event (Admin)' })
  adminCreate(@Param('patientId') patientId: string, @Body() dto: CreateEventDto) {
    dto.patientId = patientId;
    return this.service.adminCreate(dto);
  }

  @Patch('admin/:id')
  @ApiOperation({ summary: 'Update an event (Admin)' })
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.service.adminUpdate(id, dto);
  }

  @Delete('admin/:id')
  @ApiOperation({ summary: 'Delete an event (Admin)' })
  adminRemove(@Param('id') id: string) {
    return this.service.adminRemove(id);
  }
}
