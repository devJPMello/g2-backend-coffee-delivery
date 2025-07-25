import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar validação global
  app.useGlobalPipes(
    // inserir as config aqui para ValidationPipe
  );
  
  // Configurar CORS
  app.enableCors();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
