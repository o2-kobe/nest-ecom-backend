import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { User, UserRole } from '../user/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Product } from './entities/product.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-auth.guard';
import { AuditInterceptor } from '../common/interceptors/audit.interceptor';
import {
  AuditAction,
  AuditActionType,
} from '../common/decorator/audit-action.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.CREATE_PRODUCT)
  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  findAll(@CurrentUser() user: User | null, @Query() query: ProductQueryDto) {
    const role = user?.role || 'GUEST';

    return this.productsService.findAll(query, role);
  }

  @Get('featured')
  async findFeaturedProducts(@Query('limit') limit?: number) {
    const safeLimit = limit && limit > 0 ? limit : 10;
    return this.productsService.findFeaturedProducts(safeLimit);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Product> {
    await this.productsService.incrementViewCount(id);
    return this.productsService.findProductWithReviewInfo(id);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<Product> {
    await this.productsService.incrementViewCount(undefined, slug);
    return this.productsService.findBySlug(slug);
  }

  @Get(':id/related')
  findRelatedProducts(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.productsService.findRelatedProducts(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.DELETE_PRODUCT)
  @Delete(':id')
  deleteProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.remove(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.ARCHIVE_PRODUCT)
  @Patch(':id/archive')
  archiveProduct(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.productsService.archiveProduct(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.RESTORE_ARCHIVED_PRODUCT)
  @Patch(':id/restore-archived')
  restoreArchivedProduct(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.productsService.restoreArchivedProduct(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.RESTORE_DELETED_PRODUCT)
  @Patch(':id/restore-deleted')
  restoreDeletedProduct(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.productsService.restoreDeletedProduct(id);
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AuditInterceptor)
  @AuditAction(AuditActionType.UPDATE_PRODUCT)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() update: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(id, update);
  }
}
