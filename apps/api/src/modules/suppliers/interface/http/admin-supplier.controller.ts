import { supplierDecisionRequest } from '@eusse/contracts'
import { Body, Controller, HttpCode, Inject, Param, Post, Req, UseGuards } from '@nestjs/common'

import { AuthGuard, type AuthedRequest, userIdOf } from '../../../../common/auth.guard'
import { parseBody } from '../../../../common/parse-body'
import { StaffGuard } from '../../../../common/staff.guard'
import { DecideSupplierUseCase } from '../../application/decide-supplier.use-case'

import { toOwnSupplierDto } from './supplier.dto'

/** Operaciones aprueba, rechaza, suspende y reactiva proveedores (RFC-0016 §4.6). */
@Controller('admin/suppliers')
@UseGuards(AuthGuard, StaffGuard)
export class AdminSupplierController {
  constructor(@Inject(DecideSupplierUseCase) private readonly decide: DecideSupplierUseCase) {}

  @Post(':id/decision')
  @HttpCode(200)
  async decision(@Req() request: AuthedRequest, @Param('id') id: string, @Body() body: unknown) {
    const decision = parseBody(supplierDecisionRequest, body)
    const actorId = userIdOf(request)
    const supplier = await this.decide.execute(actorId, id, decision)
    return toOwnSupplierDto(supplier)
  }
}
