import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/types/user';
import { RegisterDTO } from './register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDTO } from 'src/auth/login.dto';
import { Payload } from 'src/types/payload';
import { DeleteUserDto, UpdateUserDto } from './DTO/update-user-dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private userModel: Model<User>) {}

  async create(RegisterDTO: RegisterDTO) {
    const { email } = RegisterDTO;
    const user = await this.userModel.findOne({ email });
    if (user) {
      throw new HttpException('user already exists', HttpStatus.BAD_REQUEST);
    }

    const createdUser = new this.userModel(RegisterDTO);

    await createdUser.save();
    return this.sanitizeUser(createdUser);
  }

  async update(updateUserDto: UpdateUserDto) {
    const { email } = updateUserDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }

    const updatedData = await this.userModel.findOneAndUpdate(
      { email },
      { $set: updateUserDto },
      { upsert: true, new: true },
    );

    return this.sanitizeUser(updatedData);
  }

  async delete(DeleteUserDto: DeleteUserDto) {
    const { email } = DeleteUserDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User does not exist', HttpStatus.BAD_REQUEST);
    }

    const deleteUser = await this.userModel.deleteOne({ email });
    return deleteUser;
  }

  async findByPayload(payload: Payload) {
    const { email } = payload;
    const getUser = this.userModel.findOne({ email });
    return this.sanitizeUser(await getUser);
  }

  async findByLogin(UserDTO: LoginDTO) {
    const { email, password } = UserDTO;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('user does not exists', HttpStatus.BAD_REQUEST);
    }
    if (await bcrypt.compare(password, user.password)) {
      return this.sanitizeUser(user);
    } else {
      throw new HttpException('invalid credential', HttpStatus.BAD_REQUEST);
    }
  }
  sanitizeUser(user: User) {
    const sanitized = user.toObject();
    delete sanitized['password'];
    return sanitized;
  }
}
