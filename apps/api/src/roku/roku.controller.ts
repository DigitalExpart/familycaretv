import { Controller, Post, Get, Delete, Param, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { RokuService } from './roku.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LinkDeviceDto } from './dto/link-device.dto';
import { TokenDto } from './dto/token.dto';
import { Throttle } from '@nestjs/throttler';
import { ResourceLimitGuard, ResourceType } from '../common/guards/resource-limit.guard';

@Controller('roku')
export class RokuController {
  constructor(private readonly rokuService: RokuService) {}

  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @Post('device-code')
  async getDeviceCode() {
    return this.rokuService.generateDeviceCode();
  }

  @UseGuards(JwtAuthGuard, ResourceLimitGuard)
  @ResourceType('rokuDevices')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('link-device')
  async linkDevice(@Request() req: any, @Body() dto: LinkDeviceDto) {
    return this.rokuService.linkDevice(req.user.id, dto);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('token')
  async getToken(@Body() dto: TokenDto) {
    const id = dto.deviceId || dto.code;
    if (!id) {
      throw new BadRequestException('Either deviceId or code must be provided');
    }
    return this.rokuService.getToken(id);
  }

  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @Post('validate-token')
  async validateToken(@Body() body: { token: string }) {
    if (!body.token) {
      throw new BadRequestException('token is required');
    }
    return this.rokuService.validateToken(body.token);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('refresh')
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('refreshToken is required');
    }
    return this.rokuService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('home')
  async getHome(@Request() req: any) {
    return this.rokuService.getHome(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.rokuService.getHome(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('updates')
  async getUpdates(@Request() req: any) {
    const since = req.query.since as string;
    return this.rokuService.getUpdates(req.user.id, since);
  }

  @UseGuards(JwtAuthGuard)
  @Get('screensaver')
  async getScreensaver(@Request() req: any) {
    return this.rokuService.getScreensaver(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription-status')
  async getSubscriptionStatus(@Request() req: any) {
    return this.rokuService.getSubscriptionStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('patients')
  async getPatients(@Request() req: any) {
    return this.rokuService.getPatients(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tasks')
  async getTasks(@Request() req: any) {
    return this.rokuService.getTasks(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('kids')
  async getKids(@Request() req: any) {
    return this.rokuService.getKids(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pets')
  async getPets(@Request() req: any) {
    return this.rokuService.getPets(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('devices')
  async getUserDevices(@Request() req: any) {
    return this.rokuService.getUserDevices(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('devices/:id')
  async removeDevice(@Request() req: any, @Param('id') id: string) {
    return this.rokuService.removeDevice(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/devices')
  async getAllDevicesForAdmin() {
    return this.rokuService.getAllDevicesForAdmin();
  }
}
