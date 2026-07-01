import { Controller, Get, Put, Delete, Patch, Param, Body, UseGuards, UnauthorizedException, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../database/prisma.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  @ApiOperation({ summary: 'Get all users with their activities (Admin only)' })
  async getAllUsersAdmin() {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        patients: {
          include: {
            events: true,
            medications: true,
            drawings: true,
            patientNotes: true
          }
        },
        deviceLinks: true,
      }
    });

    return {
      success: true,
      data: users,
    };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  async deleteUserAdmin(@Param('id') id: string) {
    await this.prisma.user.delete({
      where: { id },
    });
    return { success: true };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMe(@CurrentUser() user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        language: true,
        phone: true,
        gender: true,
        avatarUrl: true,
        role: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return {
      success: true,
      data: dbUser,
    };
  }

  @Get('me/referrals')
  @ApiOperation({ summary: 'Get referral stats for current user' })
  async getMyReferrals(@CurrentUser() user: any) {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { referralCode: true }
    });

    const referrals = await this.prisma.referral.findMany({
      where: { referrerId: user.id },
      include: {
        referredUser: {
          select: { firstName: true, lastName: true, createdAt: true, subscriptionStatus: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const registered = referrals.length;
    const subscribed = referrals.filter(r => r.referredUser.subscriptionStatus === 'active').length;

    return {
      success: true,
      data: {
        referralCode: dbUser?.referralCode,
        stats: {
          registered,
          subscribed
        },
        history: referrals.map(r => ({
          id: r.id,
          name: `${r.referredUser.firstName} ${r.referredUser.lastName}`,
          date: r.createdAt,
          status: r.referredUser.subscriptionStatus === 'active' ? 'Subscribed' : 'Registered'
        }))
      }
    };
  }

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Get dashboard stats for current user' })
  async getDashboardStats(@CurrentUser() user: any, @Query('date') dateParam?: string) {
    const userId = user.id;

    const patients = await this.prisma.patient.findMany({ where: { userId }, select: { id: true } });
    const patientIds = patients.map(p => p.id);
    const patientsCount = patientIds.length;

    const appointmentsCount = await this.prisma.event.count({
      where: { patientId: { in: patientIds }, type: 'APPOINTMENT' }
    });

    const medicationsCount = await this.prisma.medication.count({
      where: { 
        patientId: { in: patientIds },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      }
    });

    const notesCount = await this.prisma.patientNote.count({
      where: { patientId: { in: patientIds } }
    });

    const today = dateParam ? new Date(dateParam) : new Date();
    if (dateParam) {
      // Ensure we treat the dateParam as a local date by adding the time offset or just parsing properly
      // Because dateParam might be "2026-06-17", new Date("2026-06-17") is UTC midnight.
      // We want to simulate local time, so we just use the year/month/date string.
      const [year, month, day] = dateParam.split('-').map(Number);
      today.setFullYear(year, month - 1, day);
    }
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysEvents = await this.prisma.event.findMany({
      where: {
        patientId: { in: patientIds },
        startDateTime: { gte: today, lt: tomorrow }
      },
      include: { patient: { select: { fullName: true } } },
      orderBy: { startDateTime: 'asc' }
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[today.getDay()];

    const todaysMedications = await this.prisma.medication.findMany({
      where: {
        patientId: { in: patientIds },
        daysOfWeek: { hasSome: [todayName, 'Everyday', 'everyday', 'Daily', 'daily'] },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      include: { patient: { select: { fullName: true } } }
    });

    const medicationTasks: any[] = [];
    todaysMedications.forEach(med => {
      med.timesOfDay.forEach(timeStr => {
        const timeParts = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        const taskTime = new Date(today);
        
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = parseInt(timeParts[2], 10);
          const period = timeParts[3]?.toUpperCase();

          if (period === 'PM' && hours < 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          taskTime.setHours(hours, minutes, 0, 0);
        } else {
          // Fallback if the format is completely unexpected
          taskTime.setHours(12, 0, 0, 0);
        }

        medicationTasks.push({
          id: `${med.id}-${timeStr}`,
          title: `Take ${med.name}`,
          patientName: med.patient.fullName,
          time: taskTime,
          type: 'MEDICATION'
        });
      });
    });

    const eventTasks = todaysEvents.map(event => ({
      id: event.id,
      title: event.title,
      patientName: event.patient.fullName,
      time: event.startDateTime,
      type: event.type
    }));

    const allTasks = [...eventTasks, ...medicationTasks].sort((a, b) => a.time.getTime() - b.time.getTime());

    const verseOfTheDay = await this.prisma.bibleVerse.findFirst({
      where: { scheduledDate: { gte: today, lt: tomorrow } },
    }) || await this.prisma.bibleVerse.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const kidsCount = await this.prisma.childProfile.count({
      where: { userId }
    });

    const petsCount = await this.prisma.pet.count({
      where: { userId }
    });

    const dailyTasks = await this.prisma.task.findMany({
      where: {
        userId,
        date: { gte: today, lt: tomorrow }
      }
    });
    const completedTasks = dailyTasks.filter(t => t.completed).length;
    const totalTasks = dailyTasks.length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      success: true,
      data: {
        stats: {
          patients: patientsCount,
          appointments: appointmentsCount,
          medications: medicationsCount,
          notes: notesCount,
          kids: kidsCount,
          pets: petsCount,
        },
        taskProgress: {
          completed: completedTasks,
          total: totalTasks,
          percentage: taskProgress
        },
        todaysTasks: allTasks,
        dailyTasks: dailyTasks,
        verseOfTheDay
      }
    };
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: any, @Body() body: any) {
    const dbUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        language: body.language,
        phone: body.phone,
        gender: body.gender,
        avatarUrl: body.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        language: true,
        phone: true,
        gender: true,
        avatarUrl: true,
        role: true,
      },
    });

    return {
      success: true,
      data: dbUser,
    };
  }

  @Patch('me/push-token')
  @ApiOperation({ summary: 'Register Expo Push Token' })
  async registerPushToken(@CurrentUser() user: any, @Body() body: { pushToken: string }) {
    if (!body.pushToken) {
      return { success: false, message: 'pushToken is required' };
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { expoPushTokens: true }
    });

    const tokens = dbUser?.expoPushTokens || [];
    if (!tokens.includes(body.pushToken)) {
      tokens.push(body.pushToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { expoPushTokens: tokens }
      });
    }

    return {
      success: true,
      message: 'Push token registered',
    };
  }
}
