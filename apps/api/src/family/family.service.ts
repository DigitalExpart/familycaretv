import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { PLAN_LIMITS } from '../common/config/plan-limits.config';

@Injectable()
export class FamilyService {
  private readonly logger = new Logger(FamilyService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Invite a family member by email. Only FAMILY plan owners can invite.
   */
  async invite(ownerId: string, email: string) {
    const owner = await this.prisma.user.findUnique({
      where: { id: ownerId },
      select: { planTier: true, email: true, firstName: true },
    });

    if (!owner) throw new NotFoundException('User not found');
    if (owner.planTier !== 'FAMILY') {
      throw new ForbiddenException('Only Family Plan subscribers can invite family members. Upgrade to the Family Plan.');
    }

    if (owner.email.toLowerCase() === email.toLowerCase()) {
      throw new BadRequestException('You cannot invite yourself.');
    }

    // Check if already invited
    const existing = await this.prisma.familyMember.findFirst({
      where: { ownerId, email: email.toLowerCase() },
    });
    if (existing) {
      throw new BadRequestException('This email has already been invited to your family.');
    }

    // Check family member limit
    const currentCount = await this.prisma.familyMember.count({
      where: { ownerId, status: { in: ['PENDING', 'ACCEPTED'] } },
    });

    const limit = PLAN_LIMITS.FAMILY.familyMembers;
    if (currentCount >= limit) {
      throw new ForbiddenException(
        `Your Family Plan allows up to ${limit} invited members (Owner + ${limit}). You've reached the maximum.`
      );
    }

    // Create the invitation
    const invitation = await this.prisma.familyMember.create({
      data: {
        ownerId,
        email: email.toLowerCase(),
      },
    });

    // Check if the invited user exists and send notification
    const invitedUser = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (invitedUser) {
      await this.prisma.notification.create({
        data: {
          userId: invitedUser.id,
          type: 'SYSTEM',
          title: 'Family Plan Invitation',
          message: `${owner.firstName || 'Someone'} invited you to join their Family Plan.`,
          actionUrl: `family-invite:${invitation.inviteCode}`,
        }
      });
    }

    this.logger.log(`Family invitation created: ${ownerId} invited ${email}`);

    return {
      id: invitation.id,
      email: invitation.email,
      status: invitation.status,
      inviteCode: invitation.inviteCode,
    };
  }

  /**
   * Accept a family invitation using the invite code.
   */
  async acceptInvitation(userId: string, inviteCode: string) {
    const invitation = await this.prisma.familyMember.findUnique({
      where: { inviteCode },
    });

    if (!invitation) throw new NotFoundException('Invitation not found or has expired.');
    if (invitation.status !== 'PENDING') {
      throw new BadRequestException('This invitation has already been processed.');
    }

    // Check the accepting user's email matches
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address.');
    }

    // Check if this user is already a member of another family
    const existingMembership = await this.prisma.familyMember.findUnique({
      where: { memberId: userId },
    });
    if (existingMembership) {
      throw new BadRequestException('You are already a member of another family.');
    }

    // Accept invitation
    const updated = await this.prisma.familyMember.update({
      where: { id: invitation.id },
      data: {
        memberId: userId,
        status: 'ACCEPTED',
      },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // Grant the member FAMILY-level access by upgrading their plan tier
    await this.prisma.user.update({
      where: { id: userId },
      data: { planTier: 'FAMILY', subscriptionStatus: 'active' },
    });

    this.logger.log(`Family invitation accepted: ${userId} joined family of ${invitation.ownerId}`);

    return {
      id: updated.id,
      status: updated.status,
      owner: updated.owner,
    };
  }

  /**
   * Decline a family invitation.
   */
  async declineInvitation(userId: string, inviteCode: string) {
    const invitation = await this.prisma.familyMember.findUnique({
      where: { inviteCode },
    });

    if (!invitation) throw new NotFoundException('Invitation not found.');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (user?.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address.');
    }

    await this.prisma.familyMember.update({
      where: { id: invitation.id },
      data: { status: 'DECLINED' },
    });

    return { success: true };
  }

  /**
   * Get family members for the owner.
   */
  async getMyFamily(userId: string) {
    // Check if user is an owner
    const owned = await this.prisma.familyMember.findMany({
      where: { ownerId: userId },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Check if user is a member of someone else's family
    const membership = await this.prisma.familyMember.findUnique({
      where: { memberId: userId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });

    return {
      isOwner: owned.length > 0,
      isMember: !!membership,
      members: owned.map(m => ({
        id: m.id,
        email: m.email,
        status: m.status,
        member: m.member,
        inviteCode: m.status === 'PENDING' ? m.inviteCode : undefined,
        createdAt: m.createdAt,
      })),
      familyOwner: membership ? membership.owner : null,
    };
  }

  /**
   * Remove a family member (owner only).
   */
  async removeMember(ownerId: string, memberId: string) {
    const invitation = await this.prisma.familyMember.findFirst({
      where: { ownerId, id: memberId },
    });

    if (!invitation) throw new NotFoundException('Family member not found.');

    // If they were accepted, revert their plan tier
    if (invitation.memberId) {
      await this.prisma.user.update({
        where: { id: invitation.memberId },
        data: { planTier: 'FREE_TRIAL', subscriptionStatus: 'trialing' },
      });
    }

    await this.prisma.familyMember.delete({ where: { id: invitation.id } });

    return { success: true };
  }
}
