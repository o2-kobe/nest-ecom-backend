import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { CategoryDto } from './dto/category.dto';
import slugify from 'slugify';
import { UserRole } from '../user/entities/user.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(dto: CategoryDto, role: UserRole): Promise<Category> {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const category = this.categoryRepository.create({
      ...dto,
      slug: slugify(dto.name, {
        lower: true,
        strict: true,
        locale: 'en',
      }),
    });

    return await this.categoryRepository.save(category);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id });

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { slug } });

    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async remove(id: string, role: UserRole): Promise<void> {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const category = await this.findOne(id);

    await this.categoryRepository.remove(category);
  }

  async update(id: string, role: UserRole, update: CategoryDto) {
    if (role !== UserRole.ADMIN) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const category = await this.findOne(id);

    category.name = update.name;
    category.slug = slugify(update.name, {
      lower: true,
      strict: true,
      locale: 'en',
    });

    return await this.categoryRepository.save(category);
  }
}
