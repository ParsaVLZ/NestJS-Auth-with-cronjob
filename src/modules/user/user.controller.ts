import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateDto } from './dto/create-.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateUserRoleDto } from './dto/update-role';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createDto: CreateDto) {
    return this.userService.create(createDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  findAll() {
    return this.userService.findAll();
  }

  @Get('/profile')
  profile(@Req() request: Request) {
    return request.user;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id/role')
  @UseGuards(RolesGuard)
  updateRole(@Param('id') id: string, @Body() updateUserRoleDto: UpdateUserRoleDto, @Req() currentUser) {
    return this.userService.updateUserRole(+id, updateUserRoleDto.role, currentUser.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
