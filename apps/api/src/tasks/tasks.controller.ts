import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ResourceLimitGuard, ResourceType } from '../common/guards/resource-limit.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(ResourceLimitGuard)
  @ResourceType('tasks')
  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@CurrentUser() user: any, @Body() body: any) {
    return this.tasksService.create(user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  findAll(@CurrentUser() user: any) {
    return this.tasksService.findAll(user.id);
  }

  @Get('today')
  @ApiOperation({ summary: 'Get all tasks for today' })
  findAllToday(@CurrentUser() user: any) {
    return this.tasksService.findAllToday(user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() body: any) {
    return this.tasksService.update(id, user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tasksService.remove(id, user.id);
  }

  @Get('journal')
  @ApiOperation({ summary: 'Get journal for today' })
  getJournalToday(@CurrentUser() user: any) {
    return this.tasksService.getJournalToday(user.id);
  }

  @Post('journal')
  @ApiOperation({ summary: 'Create or update journal' })
  createJournal(@CurrentUser() user: any, @Body() body: { content: string, date: string }) {
    return this.tasksService.createJournal(user.id, body.content, new Date(body.date));
  }
}
