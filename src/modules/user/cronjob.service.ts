import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UserService } from './user.service';

@Injectable()
export class CronJobService {
  constructor(private readonly userService: UserService) {}
  @Cron('0 0 * * 6')
  async cronJob() {
    const deletedCount = await this.userService.deleteNotVerifiedAccounts();
    console.log(`Deleted ${deletedCount} Unverified accounts!`);
  }
}
