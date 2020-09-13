import { Injectable } from '@nestjs/common';
import { Producer, KafkaClient, KeyedMessage } from 'kafka-node';
import { Request } from 'express';

@Injectable()
export class AppService {
  getIP = (request: Request): string => {
    const ip = String(
      request.headers['x-forwarded-for'] ||
        request.connection.remoteAddress ||
        request.ip,
    );
    if (ip) {
      if (ip.includes(',')) {
        const split_ip = ip.split(',');
        return split_ip[0].trim();
      }
      return ip;
    }
    return '';
  };

  getKafkaPayload = (request: Request) => {
    const { originalUrl, method } = request;

    return {
      ip: this.getIP(request),
      url: originalUrl.replace(/\?.*$/, ''),
      method,
      timestamp: Date.now(),
    };
  };

  getHello(request: Request) {
    return new Promise((resolve, rej) => {
      const producer = new Producer(new KafkaClient());

      const kafkaPayload = JSON.stringify(this.getKafkaPayload(request));
      const payloads = [{ topic: 'logs', messages: kafkaPayload }];

      producer.on('ready', function() {
        producer.send(payloads, function(err, data) {
          resolve(data);
        });
      });
    });
  }
}
