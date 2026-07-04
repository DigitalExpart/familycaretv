import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { KidsService } from './kids.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResourceLimitGuard, ResourceType } from '../common/guards/resource-limit.guard';

@ApiTags('Kids')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('kids')
export class KidsController {
  constructor(private readonly kidsService: KidsService) {}

  @UseGuards(ResourceLimitGuard)
  @ResourceType('kids')
  @Post()
  @ApiOperation({ summary: 'Create a new child profile' })
  createProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.kidsService.createProfile(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all child profiles' })
  findAllProfiles(@CurrentUser() user: any) {
    return this.kidsService.findAllProfiles(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a child profile' })
  getProfile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kidsService.getProfile(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a child profile' })
  updateProfile(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.kidsService.updateProfile(id, user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a child profile' })
  removeProfile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.kidsService.removeProfile(id, user.id);
  }

  // --- Sub-resources ---

  @Post(':id/tasks')
  @ApiOperation({ summary: 'Add a task for a child' })
  addTask(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.kidsService.addTask(id, user.id, body);
  }

  @Patch(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Update a task for a child' })
  updateTask(@Param('id') id: string, @Param('taskId') taskId: string, @CurrentUser() user: any, @Body() body: any) {
    return this.kidsService.updateTask(taskId, id, user.id, body);
  }

  @Delete(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Delete a task for a child' })
  removeTask(@Param('id') id: string, @Param('taskId') taskId: string, @CurrentUser() user: any) {
    return this.kidsService.removeTask(taskId, id, user.id);
  }

  @Post(':id/events')
  @ApiOperation({ summary: 'Add a calendar event for a child' })
  addEvent(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.kidsService.addEvent(id, user.id, body);
  }

  @Post(':id/notes')
  @ApiOperation({ summary: 'Add a note for a child' })
  addNote(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.kidsService.addNote(id, user.id, body);
  }
}
