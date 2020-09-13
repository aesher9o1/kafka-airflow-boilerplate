import { NestFactory } from '@nestjs/core';
import { Consumer, KafkaClient } from 'kafka-node';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const consumer = new Consumer(new KafkaClient(), [{ topic: 'logs' }], {
    autoCommit: true,
  });

  consumer.on('message', message => console.log(message.value));

  await app.listen(3000);
}
bootstrap();
