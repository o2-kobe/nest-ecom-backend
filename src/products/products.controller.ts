import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductParamsDto } from './dto/product-param.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Product } from './entities/product.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':categoryId')
  async create(
    @Body() createProductDto: CreateProductDto,
    @CurrentUser() user: User,
  ): Promise<Product> {
    return this.productsService.create(createProductDto, user.role);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: User | null, @Query() query: ProductQueryDto) {
    // Fallback to GUEST if the user doesn't exist
    const role = user?.role || 'GUEST';

    return this.productsService.findAll(query, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string): Promise<Product> {
    return this.productsService.findBySlug(slug);
  }

  @Get('relatedProducts/:id')
  findRelatedProducts(@Param('id') id: string) {
    return this.productsService.findRelatedProducts(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  deleteProduct(@CurrentUser() user: User, @Param('id') id: string) {
    return this.productsService.remove(id, user.role);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('archive/:id')
  archiveProduct(@CurrentUser() user: User, @Param('id') id: string) {
    return this.productsService.archiveProduct(id, user.role);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('restore-archived/:id')
  restoreArchivedProduct(@CurrentUser() user: User, @Param('id') id: string) {
    return this.productsService.restoreAchivedProduct(id, user.role);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('restore-deleted/:id')
  restoreDeletedProduct(@CurrentUser() user: User, @Param('id') id: string) {
    return this.productsService.restoreDeletedProduct(id, user.role);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() update: UpdateProductDto,
  ) {
    const role = user.role;

    return this.productsService.updateProduct({ id, update, userRole: role });
  }
}
