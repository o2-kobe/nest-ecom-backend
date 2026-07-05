import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import crypto from 'crypto';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { CategoryService } from '../category/category.service';
import { UserRole } from '../user/entities/user.entity';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InventoryService } from '../inventory/inventory.service';
import { ReviewService } from '../review/review.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
    private readonly inventoryService: InventoryService,
    private readonly reviewService: ReviewService,
  ) {}

  // Create New Product
  async create(dto: CreateProductDto): Promise<Product> {
    const {
      name,
      description,
      price,
      categoryId,
      quantity,
      lowStockThreshold,
    } = dto;

    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new NotFoundException(`Selected category does not exist.`);
    }

    const product = await this.productRepository.save(
      this.productRepository.create({
        name,
        description,
        price,
        slug: this.generateSlug(dto.name),
        category: { id: dto.categoryId },
      }),
    );

    await this.inventoryService.create(product.id, {
      quantity,
      lowStockThreshold,
    });

    return await this.findOne(product.id);
  }

  //  FIND ALL
  async findAll(query: ProductQueryDto, userRole: UserRole | 'GUEST') {
    const { page, search, limit, category, sort, minPrice, maxPrice } = query;

    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory');

    if (userRole !== UserRole.ADMIN) {
      qb.andWhere('product.isActive = :isActive', {
        isActive: true,
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

    if (typeof minPrice === 'number') {
      qb.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (typeof maxPrice === 'number') {
      qb.andWhere('product.price <= :maxPrice', { maxPrice });
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

  // Find product with reviews information
  async findProductWithReviewInfo(id: string) {
    const product = await this.findOne(id);

    const reviewData = await this.reviewService.calculateAverageRating(id);

    return { ...product, ...reviewData };
  }

  // Find Product by id
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

  // Find Product By Slug
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

  // Soft Delete Product
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    await this.productRepository.softRemove(product);
  }

  async archiveProduct(id: string) {
    const result = await this.productRepository.update(id, {
      isActive: false,
    });

    if (!result.affected) {
      throw new NotFoundException('Product not found.');
    }

    return this.findOne(id);
  }

  // Restore Archived Product
  async restoreArchivedProduct(id: string) {
    const result = await this.productRepository.update(id, {
      isActive: true,
    });

    if (!result.affected) {
      throw new NotFoundException('Product not found.');
    }

    return this.findOne(id);
  }

  // Restore deleted products
  async restoreDeletedProduct(id: string) {
    const result = await this.productRepository.restore(id);

    if (!result.affected) {
      throw new NotFoundException('Product does not exist');
    }

    return await this.findOne(id);
  }

  // Update Product
  async updateProduct(id: string, update: UpdateProductDto) {
    const product = await this.findOne(id);
    const { name, description, price, categoryId } = update;

    // Verify category
    if (categoryId) {
      const category = await this.categoryService.findOne(categoryId);

      if (!category) {
        throw new NotFoundException('Selected category does not exist');
      }

      product.category = category;
    }

    if (name) {
      product.name = name;
    }

    if (description) {
      product.description = description;
    }

    if (price) {
      product.price = price;
    }

    return await this.productRepository.save(product);
  }

  // Find Related Products
  async findRelatedProducts(productId: string, limit = 6) {
    const product = await this.findOne(productId);

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.inventory', 'inventory')
      .where('product.id != :id', { id: productId })
      .andWhere('inventory.quantity > 0')
      .andWhere('product.isActive = :isActive', { isActive: true });

    qb.addSelect(
      `( 
       CASE WHEN product.categoryId = :categoryId THEN 10 ELSE 0 END
       +
       CASE 
         WHEN product.name ILIKE :name THEN 8
         WHEN product.name ILIKE :namePrefix THEN 6
         ELSE 0
       END
       +
       CASE
         WHEN ABS(product.price - :price) <= :price * 0.1 THEN 5
         WHEN ABS(product.price - :price) <= :price * 0.3 THEN 3
         ELSE 0
       END
     )`,
      'score',
    );

    qb.setParameters({
      id: productId,
      categoryId: product.category.id,
      name: `%${product.name}%`,
      namePrefix: `${product.name.split(' ')[0]}%`,
      price: product.price,
      isActive: true,
    });

    qb.orderBy('score', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .take(limit);

    return await qb.getMany();
  }

  async findFeaturedProducts(limit = 10) {
    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true });

    // Sort highest viewed
    qb.orderBy('product.viewCount', 'DESC');

    // Break ties with which ones were created first
    qb.addOrderBy('product.createdAt', 'DESC');

    qb.take(limit);

    return await qb.getMany();
  }

  async incrementViewCount(id?: string, slug?: string): Promise<void> {
    const key = id ? 'id' : 'slug';
    const value = id || slug;

    if (!value) {
      return;
    }

    await this.productRepository.increment({ [key]: value }, 'viewCount', 1);
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
