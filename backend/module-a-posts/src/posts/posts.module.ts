import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { SchedulerService } from './scheduler.service';
import { MockPublisher, PUBLISHER } from './publisher';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [
    PostsService,
    SchedulerService,
   
    { provide: PUBLISHER, useClass: MockPublisher },
  ],
  exports: [PostsService],
})
export class PostsModule {}

