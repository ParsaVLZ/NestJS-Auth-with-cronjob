import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { UserRole } from '../../user/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException("User not found!");
    }
    if (user.role !== UserRole.Admin) {
      throw new ForbiddenException("Access denied!");
    }
    return true;
  }
}
