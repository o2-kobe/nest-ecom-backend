import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { CategoryDto } from './dto/category.dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() dto: CategoryDto, @CurrentUser() user: User) {
    return this.categoryService.create(dto, user.role);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoryService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.categoryService.remove(id, user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() update: CategoryDto,
  ) {
    return this.categoryService.update(id, user.role, update);
  }
}
