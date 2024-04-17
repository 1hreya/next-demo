import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Put,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';
import { RegisterDTO } from 'src/user/register.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './login.dto';
import { DeleteUserDto, UpdateUserDto } from 'src/user/DTO/update-user-dto';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Get('onlyauth')
  @UseGuards(AuthGuard('jwt'))
  async hiddenInformation() {
    return 'hidden information';
  }

  @Get('/anyone')
  @UseGuards(AuthGuard('jwt'))
  async publicInformation(@Body() registerDTO: RegisterDTO) {
    const user = await this.userService.findByPayload(registerDTO);
    return { user };
  }

  @Post('register')
  async register(@Body() registerDTO: RegisterDTO) {
    const user = await this.userService.create(registerDTO);
    const payload = {
      email: user.email,
    };

    const token = await this.authService.signPayload(payload);
    return { user, token };
  }
  @Post('login')
  async login(@Body() loginDTO: LoginDTO) {
    const user = await this.userService.findByLogin(loginDTO);
    const payload = {
      email: user.email,
    };
    const token = await this.authService.signPayload(payload);
    return { user, token };
  }
  @Put('update')
  async update(@Body() updateDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(updateDto);
    return { user: updatedUser, message: 'User updated successfully' };
  }

  @Delete('delete')
  async delete(@Body() deleteUserDto: DeleteUserDto) {
    const deletedUser = await this.userService.delete(deleteUserDto);
    return { user: deletedUser, message: 'User deleted successfully' };
  }
}
