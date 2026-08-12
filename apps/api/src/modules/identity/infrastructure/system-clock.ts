import { Injectable } from '@nestjs/common'

import type { ClockPort } from '../domain/ports/clock.port'

/** El reloj de verdad. Los tests usan `FakeClock`. */
@Injectable()
export class SystemClock implements ClockPort {
  now(): Date {
    return new Date()
  }
}
