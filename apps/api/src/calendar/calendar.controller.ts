import { Controller, Get, Req, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CalendarAggregatorService } from './calendar.service';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarAggregatorService) {}

  @Get()
  async getCalendar(@Req() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    return this.calendarService.getCalendarEvents(req.user.userId, start, end);
  }
}
