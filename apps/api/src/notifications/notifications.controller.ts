import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async getNotifications(@Request() req) {
    const notifications = await this.notificationsService.getUserNotifications(req.user.userId);
    return {
      success: true,
      data: notifications,
    };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    await this.notificationsService.markAsRead(req.user.userId, id);
    return {
      success: true,
      message: 'Notification marked as read',
    };
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Mark a notification as unread' })
  async markAsUnread(@Request() req, @Param('id') id: string) {
    await this.notificationsService.markAsUnread(req.user.userId, id);
    return {
      success: true,
      message: 'Notification marked as unread',
    };
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }
}
