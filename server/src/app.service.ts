import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World from Sunset Memories API!';
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
