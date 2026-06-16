import { Controller, Get, Post, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validateCode(@Body('code') code: string) {
    return this.referralsService.validateCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-code')
  getMyCode(@Req() req: any) {
    return this.referralsService.getMyCode(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-referrals')
  getMyReferrals(@Req() req: any) {
    return this.referralsService.getMyReferrals(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats(@Req() req: any) {
    return this.referralsService.getStats(req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAllForAdmin(@Req() req: any) {
    // Ideally use RolesGuard here to ensure ADMIN access
    if (req.user.role !== 'ADMIN') {
       return { success: false, message: 'Forbidden' };
    }
    return this.referralsService.getAllReferralsForAdmin();
  }
}
