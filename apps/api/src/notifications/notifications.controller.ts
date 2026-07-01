import { Controller, Get, Patch, Delete, Param, UseGuards, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from './events/notification.event';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async getNotifications(@CurrentUser() user: any) {
    const notifications = await this.notificationsService.getUserNotifications(user.id);
    return {
      success: true,
      data: notifications,
    };
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnreadNotifications(@CurrentUser() user: any) {
    const notifications = await this.notificationsService.getUnreadNotifications(user.id);
    return {
      success: true,
      data: notifications,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@CurrentUser() user: any, @Param('id') id: string) {
    await this.notificationsService.markAsRead(user.id, id);
    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark a notification as unread' })
  async markAsUnread(@CurrentUser() user: any, @Param('id') id: string) {
    await this.notificationsService.markAsUnread(user.id, id);
    return {
      success: true,
      message: 'Notification marked as unread',
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    await this.notificationsService.markAllAsRead(user.id);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(@CurrentUser() user: any, @Param('id') id: string) {
    await this.notificationsService.deleteNotification(user.id, id);
    return {
      success: true,
      message: 'Notification deleted',
    };
  }

  @Post('test-matrix')
  @ApiOperation({ summary: 'Trigger Test Matrix for Notifications' })
  async triggerTestMatrix(@CurrentUser() user: any) {
    const types = [
      { type: 'MEDICATION_REMINDER', title: 'Test Medication' },
      { type: 'APPOINTMENT_REMINDER', title: 'Test Appointment' },
      { type: 'TASK_REMINDER', title: 'Test Task' },
      { type: 'HOMEWORK', title: 'Test Homework' },
      { type: 'PET_MEDICATION', title: 'Test Pet Medication' },
      { type: 'PET_VACCINATION', title: 'Test Pet Vaccine' },
      { type: 'BIBLE_VERSE', title: 'Test Bible Verse' },
      { type: 'EMERGENCY', title: 'Test Emergency Alert' },
      { type: 'SYSTEM', title: 'Test General Notification' }
    ];

    for (const test of types) {
      const event = new NotificationEvent();
      event.userId = user.id;
      event.type = test.type;
      event.title = test.title;
      event.message = `This is a test notification for ${test.type} triggered by the Test Matrix.`;
      event.priority = test.type === 'EMERGENCY' ? 'HIGH' : 'NORMAL';
      
      this.eventEmitter.emit('notification.create', event);
    }

    return {
      success: true,
      message: 'Test Matrix Triggered. 9 Notifications generated.',
    };
  }
}
