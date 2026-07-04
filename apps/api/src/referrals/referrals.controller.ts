import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  getAllForAdmin() {
    return this.referralsService.getAllReferralsForAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/codes')
  getAllReferralCodes() {
    return this.referralsService.getAllReferralCodes();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/codes')
  createReferralCode(@Body() body: any) {
    return this.referralsService.createReferralCode(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('admin/codes/:id')
  updateReferralCode(@Param('id') id: string, @Body() body: any) {
    return this.referralsService.updateReferralCode(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/codes/:id')
  deleteReferralCode(@Param('id') id: string) {
    return this.referralsService.deleteReferralCode(id);
  }
}
