import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import { Roles } from 'src/auth/roles.enum';
import { UpdateUsernameDto } from 'src/auth/dto/update-username.dto';
import { Hobby } from 'src/hobby/hobby.entity';
import { UserHobby } from 'src/hobby/user-hobby.entity';
import { UpdateAvatarDto } from 'src/auth/dto/update-avatar.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Hobby)
    private hobbyRepository: Repository<Hobby>,
    @InjectRepository(UserHobby)
    private userHobbyRepository: Repository<UserHobby>,
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

  async activatePlusSubscription(userId: number, expiresAt: Date): Promise<User> {
    const user = await this.findById(userId);
    user.isPlusSubscriber = true;
    user.plusSubscriptionExpiresAt = expiresAt;
    return this.usersRepository.save(user);
  }

  async checkAndUpdateSubscriptionStatus(userId: number): Promise<User> {
    const user = await this.findById(userId);
    if (user.plusSubscriptionExpiresAt && user.plusSubscriptionExpiresAt < new Date()) {
      user.isPlusSubscriber = false;
      user.plusSubscriptionExpiresAt = null;
      await this.usersRepository.save(user);
    }
    return user;
  }

  async getSubscriptionStatus(userId: number): Promise<{ isPlusSubscriber: boolean; plusSubscriptionExpiresAt: Date | null }> {
    const user = await this.findById(userId);
    return {
      isPlusSubscriber: user.isPlusSubscriber,
      plusSubscriptionExpiresAt: user.plusSubscriptionExpiresAt,
    };
  }

  
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } })

    if (!user) throw new NotFoundException('Пользователь не найден!')
    return user
  }

  async updateAvatar(userId: number, dto: UpdateAvatarDto): Promise<User> {
    const user = await this.findById(userId);
    if (dto.avatar) {
      user.avatar = dto.avatar; 
    }
    return this.usersRepository.save(user);
  }

  async getDescription(userId: number): Promise<string> {
    const user = await this.findById(userId);
    return user.description;
  }

  async updateDescription(userId: number, description: string): Promise<User> {
    const user = await this.findById(userId);
    user.description = description;
    return this.usersRepository.save(user);
  }

  async uploadAvatar(userId: number, filePath: string): Promise<User> {
    const user = await this.findById(userId);
    user.avatar = `/uploads/${filePath}`; 
    return this.usersRepository.save(user);
  }

  public async findByUsername(username: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { username } });
  }

  public async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
 
  public async validateUser(email: string, password: string): Promise<User> {
    const user = await this.findByEmail(email);

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

  async updateAge(userId: number, age: number): Promise<User> {
    const user = await this.findById(userId);
    user.age = age;
    return this.usersRepository.save(user);
  }

  async updateCity(userId: number, city: string): Promise<User> {
    const user = await this.findById(userId);
    user.city = city;
    return this.usersRepository.save(user);
  }

  async getUserHobbies(userId: number): Promise<Hobby[]> {
    const userWithHobbies = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['hobbies', 'hobbies.hobby'],
    });

    if (!userWithHobbies) {
      throw new NotFoundException('Пользователь не найден!');
    }

    return userWithHobbies.hobbies.map(uh => uh.hobby);
  }

  async addHobbies(userId: number, hobbyNames: string[]): Promise<Hobby[]> {
    if (!hobbyNames || hobbyNames.length === 0) {
      throw new BadRequestException('Никаких увлечений не предусмотрено!');
    }

    const user = await this.findById(userId);
    
    const existingHobbies = await this.hobbyRepository.find({
      where: { name: In(hobbyNames) }
    });

    const newHobbies = hobbyNames
      .filter(name => !existingHobbies.some(h => h.name === name))
      .map(name => {
        const hobby = new Hobby();
        hobby.name = name;
        return hobby;
      });

    if (newHobbies.length > 0) {
      await this.hobbyRepository.save(newHobbies);
    }

    const allHobbies = [...existingHobbies, ...newHobbies];

    const existingConnections = await this.userHobbyRepository.find({
      where: {
        userId,
        hobbyId: In(allHobbies.map(h => h.id))
      }
    });

    const newConnections = allHobbies
      .filter(hobby => !existingConnections.some(c => c.hobbyId === hobby.id))
      .map(hobby => {
        const userHobby = new UserHobby();
        userHobby.userId = userId;
        userHobby.hobbyId = hobby.id;
        return userHobby;
      });

    if (newConnections.length > 0) {
      await this.userHobbyRepository.save(newConnections);
    }

    return allHobbies;
  }

  async removeHobby(userId: number, hobbyId: number): Promise<void> {
    const connection = await this.userHobbyRepository.findOne({
      where: { userId, hobbyId }
    });

    if (!connection) {
      throw new NotFoundException('Хобби для пользователя не найдены!');
    }

    await this.userHobbyRepository.remove(connection);
  }

  async getHobbyByName(name: string): Promise<Hobby | undefined> {
    return this.hobbyRepository.findOne({ where: { name } });
  }

  async updatePassword(email: string, newPassword: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) throw new NotFoundException('Пользователь не найден');
  
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(newPassword, salt);
  
    user.password = hashPassword;
    await this.usersRepository.save(user);
  }
  
}
