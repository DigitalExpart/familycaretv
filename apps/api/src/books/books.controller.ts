import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { createClient } from '@supabase/supabase-js';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';

@ApiTags('Books')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all books, optionally filtered by language' })
  getAllBooks(@Query('language') language?: string) {
    return this.booksService.getAllBooks(language);
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured books' })
  getFeaturedBooks(@Query('language') language?: string) {
    return this.booksService.getFeaturedBooks(language);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new BadRequestException('Supabase credentials not configured on server');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;

    const { data, error } = await supabase.storage
      .from('books')
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) {
      throw new BadRequestException(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from('books').getPublicUrl(filename);

    return {
      url: publicUrlData.publicUrl
    };
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Add a book (Admin only)' })
  addBook(@Body() body: any) {
    return this.booksService.addBook(body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  @ApiOperation({ summary: 'Update a book (Admin only)' })
  updateBook(@Param('id') id: string, @Body() body: any) {
    return this.booksService.updateBook(id, body);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book (Admin only)' })
  removeBook(@Param('id') id: string) {
    return this.booksService.removeBook(id);
  }
}
