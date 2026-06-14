import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { RokuService } from './roku.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LinkDeviceDto } from './dto/link-device.dto';
import { TokenDto } from './dto/token.dto';

@Controller('roku')
export class RokuController {
  constructor(private readonly rokuService: RokuService) {}

  @Post('device-code')
  async getDeviceCode() {
    return this.rokuService.generateDeviceCode();
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-device')
  async linkDevice(@Request() req: any, @Body() dto: LinkDeviceDto) {
    return this.rokuService.linkDevice(req.user.userId, dto.code);
  }

  @Post('token')
  async getToken(@Body() dto: TokenDto) {
    return this.rokuService.getToken(dto.deviceId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.rokuService.getDashboard(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('screensaver')
  async getScreensaver(@Request() req: any) {
    return this.rokuService.getScreensaver(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription-status')
  async getSubscriptionStatus(@Request() req: any) {
    return this.rokuService.getSubscriptionStatus(req.user.userId);
  }
}
