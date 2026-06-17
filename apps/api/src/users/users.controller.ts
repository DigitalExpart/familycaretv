import { Controller, Get, Put, Delete, Param, Body, UseGuards, UnauthorizedException } from '@nestjs/common';
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

  @Get('me/dashboard')
  @ApiOperation({ summary: 'Get dashboard stats for current user' })
  async getDashboardStats(@CurrentUser() user: any) {
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

    const today = new Date();
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
        daysOfWeek: { has: todayName },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
      },
      include: { patient: { select: { fullName: true } } }
    });

    const medicationTasks: any[] = [];
    todaysMedications.forEach(med => {
      med.timesOfDay.forEach(timeStr => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const taskTime = new Date(today);
        taskTime.setHours(hours, minutes, 0, 0);

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

    return {
      success: true,
      data: {
        stats: {
          patients: patientsCount,
          appointments: appointmentsCount,
          medications: medicationsCount,
          notes: notesCount
        },
        todaysTasks: allTasks,
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
}
