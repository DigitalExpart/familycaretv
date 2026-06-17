import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ColoringService } from './coloring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Coloring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coloring-pages')
export class ColoringController {
  constructor(private readonly coloringService: ColoringService) {}

  @Get()
  @ApiOperation({ summary: 'Get all coloring pages, optionally filtered by language' })
  getAllPages(@Query('language') language?: string) {
    return this.coloringService.getAllPages(language);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Add a coloring page (Admin only)' })
  addPage(@Body() body: any) {
    return this.coloringService.addPage(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coloring page (Admin only)' })
  removePage(@Param('id') id: string) {
    return this.coloringService.removePage(id);
  }
}
