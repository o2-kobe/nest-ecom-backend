import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

interface ReviewAggregationRaw {
  average: string | null;
  count: string | null;
}

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async createReview(userId: string, dto: CreateReviewDto): Promise<Review> {
    const { productId, rating, comment } = dto;

    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this product.');
    }

    const review = this.reviewRepository.create({
      rating,
      comment,
      user: { id: userId },
      product: { id: productId },
    });

    try {
      return await this.reviewRepository.save(review);
    } catch {
      throw new BadRequestException(
        'Could not create review. Ensure the product exists.',
      );
    }
  }
  async findProductReviews(productId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
  async findOne(id: string, userId?: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: {
        id,
        ...(userId && { user: { id: userId } }), // Scopes to user only if userId is provided
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found or unauthorized');
    }

    return review;
  }

  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    const { comment, rating } = dto;
    const review = await this.findOne(userId, reviewId);

    if (comment !== undefined) {
      review.comment = comment;
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    return await this.reviewRepository.save(review);
  }

  async deleteReview(
    userId: string,
    userRole: string,
    reviewId: string,
  ): Promise<void> {
    const isModelatorOrAdmin = userRole === 'admin';

    const review = await this.findOne(
      reviewId,
      isModelatorOrAdmin ? undefined : userId,
    );

    await this.reviewRepository.remove(review);
  }

  async calculateAverageRating(
    productId: string,
  ): Promise<{ averageRating: number; totalReviews: number }> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId = :productId', { productId })
      .getRawOne<ReviewAggregationRaw>();

    const averageRating = result?.average ? parseFloat(result.average) : 0;
    const totalReviews = result?.count ? parseInt(result.count, 10) : 0;

    const roundedAverage = Math.ceil(averageRating * 10) / 10;

    return {
      averageRating: roundedAverage,
      totalReviews,
    };
  }
}
