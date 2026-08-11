import { Global, Module } from '@nestjs/common'

import { ConfigModule } from './config/config.module'
import { NotificationsConsumer } from './processors/notifications.consumer'
import { OutboxRelayService } from './processors/outbox-relay.service'
import { PrismaService } from './shared/prisma.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, OutboxRelayService, NotificationsConsumer],
  exports: [PrismaService],
})
export class AppModule {}
