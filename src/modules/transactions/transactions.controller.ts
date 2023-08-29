import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { AbstractPaginationDto } from '../../shared/dto/abstract-pagination.dto';
import { resolveResponse } from '../../shared/resolvers';
import { User } from '../users/interface/user.interface';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../../shared/guards/auth.guard';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll(@Query() pagination: AbstractPaginationDto, @CurrentUser() user: User) {
    return resolveResponse(this.transactionsService.findUserTransactions(pagination, user));
  }
}
