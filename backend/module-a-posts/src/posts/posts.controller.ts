import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post as HttpPost,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { SchedulePostDto } from './dto/schedule-post.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { PostStatus } from './post-status';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // ---------------------------------------------------------------------------
  // CRUD
  // ---------------------------------------------------------------------------
  @HttpPost()
  create(@Body() dto: CreatePostDto) {
    return this.postsService.create(dto);
  }

  /** Bulk CSV import — accepts an array of post objects in the request body. */
  @HttpPost('bulk')
  bulkCreate(@Body() dtos: CreatePostDto[]) {
    return this.postsService.bulkCreate(dtos);
  }

  @Get()
  findAll(
    @Query('status')   status?:   string,
    @Query('platform') platform?: string,
    @Query('from')     from?:     string,
    @Query('to')       to?:       string,
    @Query('evergreen') evergreen?: string,
  ) {
    return this.postsService.findAll({ status, platform, from, to, evergreen });
  }

  @Get('stats')
  getStats() {
    return this.postsService.getStats();
  }

  /** Returns all evergreen posts regardless of their current status. */
  @Get('evergreen')
  getEvergreen() {
    return this.postsService.findAll({ evergreen: 'true' });
  }

  /** Manually trigger the evergreen recycle pass (useful for admin/testing). */
  @HttpPost('evergreen/recycle')
  @HttpCode(HttpStatus.OK)
  async recycleEvergreen() {
    const recycled = await this.postsService.recycleEvergreen();
    return { recycled };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(id, dto);
  }

  // ---------------------------------------------------------------------------
  // Approval workflow: DRAFT → PENDING_REVIEW → APPROVED → SCHEDULED
  // ---------------------------------------------------------------------------
  @Patch(':id/schedule')
  schedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SchedulePostDto,
  ) {
    return this.postsService.schedule(id, new Date(dto.scheduledAt));
  }

  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.postsService.changeStatus(id, dto.status as PostStatus);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}