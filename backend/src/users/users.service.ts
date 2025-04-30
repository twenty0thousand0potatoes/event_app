import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { Roles } from 'src/auth/roles.enum';
import { UpdateUsernameDto } from 'src/auth/dto/update-username.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  public async createUser(email: string, password: string): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = this.usersRepository.create({
      email,
      username:email,
      password: hashPassword,
      role:Roles.USER
    });

    return this.usersRepository.save(user);
  }

  
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })

    if (!user) throw new NotFoundException('Пользователь не найден!')
    return user
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
 
  public async validateUser(username: string, password: string): Promise<User> {
    const user = await this.findByUsername(username);

    if (!user) {
      throw new NotFoundException('Пользователь не найден!');
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async updateUsername(userId: number, dto: UpdateUsernameDto): Promise<User> {
    const user = await this.findById(userId)
    user.username = dto.username
    return this.usersRepository.save(user)
  }
}
