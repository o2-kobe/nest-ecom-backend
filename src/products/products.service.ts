import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoryService } from '../category/category.service';
import crypto from 'crypto';
import { UserRole } from '../user/entities/user.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
  ) {}

  // Create
  async create(dto: CreateProductDto): Promise<Product> {
    const category = await this.categoryService.findOne(dto.categoryId);

    if (!category) {
      throw new NotFoundException(`Selected category does not exist.`);
    }

    const product = this.productRepository.create({
      ...dto,
      slug: this.generateSlug(dto.name),
      category: { id: dto.categoryId },
    });

    return await this.productRepository.save(product);
  }

  //  FIND ALL
  async findAll(query: ProductQueryDto, isActive?: boolean) {
    const { page, search, limit, category, sort } = query;

    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (typeof isActive === 'boolean') {
      qb.where('product.isActive = :isActive', {
        isActive,
      });
    }

    if (search) {
      qb.andWhere(
        'product.name ILIKE :search OR product.description ILIKE :search',
        {
          search: `%${search}%`,
        },
      );
    }

    if (category) {
      qb.andWhere('category.slug = :category', { category });
    }

    if (sort === 'price_asc') {
      qb.orderBy('product.price', 'ASC');
    } else if (sort === 'price_desc') {
      qb.orderBy('product.price', 'DESC');
    } else {
      qb.orderBy('product.createdAt', 'DESC');
    }

    const total = await qb.getCount();

    const products = await qb.skip(skip).take(limit).getMany();

    return {
      data: products,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // FIND ALL for customers
  async findAllPublic(query: ProductQueryDto) {
    return await this.findAll(query, true);
  }

  // FIND ALL for ADMIN
  async findAllAdmin(query: ProductQueryDto) {
    return await this.findAll(query);
  }

  // FInd by id
  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product does not exist');
    }

    return product;
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: { category: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} does not exist`);
    }

    return product;
  }

  async remove(id: string, userRole: UserRole): Promise<void> {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const product = await this.findOne(id);

    await this.productRepository.softRemove(product);
  }

  async archiveProduct(id: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const result = await this.productRepository.update(id, {
      isActive: false,
    });

    if (!result.affected) {
      throw new NotFoundException('Product not found.');
    }

    return this.findOne(id);
  }

  async restoreProduct(id: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const result = await this.productRepository.update(id, {
      isActive: true,
    });

    if (!result.affected) {
      throw new NotFoundException('Product not found.');
    }

    return this.findOne(id);
  }

  async restoreDeletedProduct(id: string, userRole: UserRole) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permission');
    }

    const result = await this.productRepository.restore(id);

    if (!result.affected) {
      throw new NotFoundException('Product does not exist');
    }

    return await this.findOne(id);
  }

  // /////////////////////////
  async updateProduct(
    id: string,
    update: UpdateProductDto,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions.');
    }

    const { name, categoryId, description, price, stock } = update;

    // Verify category
    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new NotFoundException('Selected category does not exist');
    }

    const product = await this.findOne(id);

    if (name) {
      product.slug = this.generateSlug(name);
      product.name = name;
    }

    if (description) {
      product.description = description;
    }

    if (price) {
      product.price = price;
    }
    if (stock) {
      product.stock = stock;
    }

    return await this.productRepository.save(product);
  }

  private generateSlug(productName: string) {
    const suffix = crypto.randomBytes(3).toString('hex');
    const slug = slugify(productName, {
      locale: 'en',
      lower: true,
      strict: true,
    });

    return `${slug}-${suffix}`;
  }
}

/**
 * 
findFeaturedProducts()

findRelatedProducts(productId)
 */
