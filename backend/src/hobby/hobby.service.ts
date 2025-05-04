import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Hobby } from './hobby.entity'

@Injectable()
export class HobbyService {
  constructor(
    @InjectRepository(Hobby)
    private hobbyRepository: Repository<Hobby>
  ) {}

  findAll(): Promise<Hobby[]> {
    return this.hobbyRepository.find()
  }

  async findOne(id: number): Promise<Hobby> {
    const hobby = await this.hobbyRepository.findOne({ where: { id } })
    if (!hobby) {
      throw new NotFoundException(`Хобби с id=${id} не найдено`)
    }
    return hobby
  }
}
