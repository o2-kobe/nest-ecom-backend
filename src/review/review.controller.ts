import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createReview(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    return this.reviewService.createReview(user.id, dto);
  }

  @Get('product/:id')
  findProductReviews(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.reviewService.findProductReviews(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  updateReview(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteReview(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.reviewService.deleteReview(user.id, user.role, id);
  }
}
