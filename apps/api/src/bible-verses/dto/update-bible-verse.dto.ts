import { PartialType } from '@nestjs/mapped-types';
import { CreateBibleVerseDto } from './create-bible-verse.dto';

export class UpdateBibleVerseDto extends PartialType(CreateBibleVerseDto) {}
