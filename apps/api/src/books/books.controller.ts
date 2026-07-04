import { Controller, Get, Post, Put, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

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
