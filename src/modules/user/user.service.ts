import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateDto } from './dto/create-.dto';
import { UpdateDto } from './dto/update-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(createDto: CreateDto) {
    return this.userRepository.save(createDto);
  }

  findAll() {
    return this.userRepository.find();
  }

  findOne(id: number) {
    const user = this.userRepository.findOne({ where: {id}});
    if (!user) {
      throw new NotFoundException("User with this id doesn't exist!");
    }
    return user;;
  }

  update(id: number, updateDto: UpdateDto) {
    return this.userRepository.update(id, updateDto);
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }

  async updateUserRole(id: number, role: UserRole, currentUser: UserEntity){
    if (currentUser.role !== UserRole.Admin) {
      throw new UnauthorizedException('Only admins can change user roles!');
    }
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException("User with this id not found!");
    }
    user.role = role;
    return this.userRepository.save(user);
  }

  async deleteNotVerifiedAccounts() {
    const result = await this.userRepository.delete({mobile_verify: false});
    return result.affected || 0;
  }
}
