// src/coffee/coffee.module.ts
import { Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [CoffeesController],
  providers: [CoffeesService],
  imports: [PrismaModule],
})
export class CoffeeModule {}
