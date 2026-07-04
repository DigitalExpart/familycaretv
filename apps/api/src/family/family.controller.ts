import { Controller, Post, Get, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { FamilyService } from './family.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('Family')
@ApiBearerAuth()
@Controller('family')
@UseGuards(JwtAuthGuard)
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invite a family member by email (Family Plan only)' })
  @ApiBody({ schema: { properties: { email: { type: 'string' } } } })
  async invite(@Req() req, @Body() body: { email: string }) {
    const userId = req.user.id || req.user.userId;
    return this.familyService.invite(userId, body.email);
  }

  @Post('accept')
  @ApiOperation({ summary: 'Accept a family invitation using the invite code' })
  @ApiBody({ schema: { properties: { inviteCode: { type: 'string' } } } })
  async accept(@Req() req, @Body() body: { inviteCode: string }) {
    const userId = req.user.id || req.user.userId;
    return this.familyService.acceptInvitation(userId, body.inviteCode);
  }

  @Post('decline')
  @ApiOperation({ summary: 'Decline a family invitation' })
  @ApiBody({ schema: { properties: { inviteCode: { type: 'string' } } } })
  async decline(@Req() req, @Body() body: { inviteCode: string }) {
    const userId = req.user.id || req.user.userId;
    return this.familyService.declineInvitation(userId, body.inviteCode);
  }

  @Get()
  @ApiOperation({ summary: 'Get your family members and invitations' })
  async getMyFamily(@Req() req) {
    const userId = req.user.id || req.user.userId;
    return this.familyService.getMyFamily(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a family member (owner only)' })
  async removeMember(@Req() req, @Param('id') memberId: string) {
    const userId = req.user.id || req.user.userId;
    return this.familyService.removeMember(userId, memberId);
  }
}
