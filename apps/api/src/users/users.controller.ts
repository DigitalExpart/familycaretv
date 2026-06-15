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

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMe(@CurrentUser() user: any, @Body() body: any) {
    const dbUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        language: body.language,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        language: true,
        role: true,
      },
    });

    return {
      success: true,
      data: dbUser,
    };
  }
}
