import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AiService } from '../ai/ai.service';
import { MedicationLookupDto } from './dto/medication-lookup.dto';
import { AiUsageGuard } from '../common/guards/ai-usage.guard';
import { ResourceLimitGuard, ResourceType } from '../common/guards/resource-limit.guard';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

@ApiTags('Medications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(
    private readonly service: MedicationsService,
    private readonly aiService: AiService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  @UseGuards(AiUsageGuard)
  @Post('lookup')
  @ApiOperation({ summary: 'Lookup medication information using AI (daily limit applies for Personal plan)' })
  async lookupMedication(@Body() dto: MedicationLookupDto, @Req() req: any) {
    const result = await this.aiService.lookupMedication(dto.medication, dto.language);
    
    // Only record AI usage if it was NOT a cache hit (cache hits are free)
    if (!result.cached && req.aiUsageAuthorized) {
      const userId = req.user.id || req.user.userId;
      await this.subscriptionsService.recordAiUsage(userId);
    }
    
    return result;
  }

  @UseGuards(ResourceLimitGuard)
  @ResourceType('medications')
  @Post()
  @ApiOperation({ summary: 'Create a medication for a patient' })
  create(@CurrentUser() user: any, @Body() dto: CreateMedicationDto) {
    return this.service.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medications for a specific patient' })
  @ApiQuery({ name: 'patientId', required: true })
  findAll(@CurrentUser() user: any, @Query('patientId') patientId: string) {
    return this.service.findAll(user.id, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific medication' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a medication' })
  update(@Param('id') id: string, @CurrentUser() user: any, @Body() dto: UpdateMedicationDto) {
    return this.service.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a medication' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user.id);
  }

  // --- ADMIN ENDPOINTS ---

  @Post('admin/patient/:patientId')
  @ApiOperation({ summary: 'Create a medication (Admin)' })
  adminCreate(@Param('patientId') patientId: string, @Body() dto: CreateMedicationDto) {
    dto.patientId = patientId;
    return this.service.adminCreate(dto);
  }

  @Patch('admin/:id')
  @ApiOperation({ summary: 'Update a medication (Admin)' })
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateMedicationDto) {
    return this.service.adminUpdate(id, dto);
  }

  @Delete('admin/:id')
  @ApiOperation({ summary: 'Delete a medication (Admin)' })
  adminRemove(@Param('id') id: string) {
    return this.service.adminRemove(id);
  }
}
