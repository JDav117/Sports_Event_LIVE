import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const team = this.teamRepository.create(createTeamDto);
    return await this.teamRepository.save(team);
  }

  async findAll(filters?: {
    coach?: string;
    sportType?: string;
    category?: string;
    tags?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Team[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.teamRepository.createQueryBuilder('team');

    if (filters?.coach) {
      queryBuilder.andWhere('team.coach LIKE :coach', {
        coach: `%${filters.coach}%`,
      });
    }

    if (filters?.sportType) {
      queryBuilder.andWhere('team.sportType = :sportType', {
        sportType: filters.sportType,
      });
    }

    if (filters?.category) {
      queryBuilder.andWhere('team.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.tags) {
      queryBuilder.andWhere('team.tags LIKE :tags', {
        tags: `%${filters.tags}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: ['events', 'enrollments'],
    });

    if (!team) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    return team;
  }

  async update(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.findOne(id);
    Object.assign(team, updateTeamDto);
    return await this.teamRepository.save(team);
  }

  async remove(id: string): Promise<void> {
    const team = await this.findOne(id);
    await this.teamRepository.remove(team);
  }

  async getTeamEnrollmentCount(teamId: string): Promise<number> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['enrollments'],
    });

    if (!team) {
      throw new NotFoundException(`Equipo con ID ${teamId} no encontrado`);
    }

    return team.enrollments?.filter((e) => e.status === 'approved').length || 0;
  }
}
