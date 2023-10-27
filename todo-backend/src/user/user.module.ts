// Modules
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

// Controllers
import { UserController } from './user.controller';

// Services
import { UserService } from './user.service';

// Entities
import { User } from './entities/user.entity';

import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  exports: [TypeOrmModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
