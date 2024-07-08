import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { EmployeeRoleType } from './types';
import * as bcrypt from 'bcrypt';

const saltOrRounds = 10;
@Injectable()
export class EmployeesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createEmployeeDto: Prisma.EmployeeCreateInput) {
    console.log('=====', createEmployeeDto);
    createEmployeeDto.password = await bcrypt.hash(
      createEmployeeDto.password,
      saltOrRounds,
    );
    return this.databaseService.employee.create({ data: createEmployeeDto });
  }

  async findAll(role?: EmployeeRoleType) {
    return this.databaseService.employee.findMany({
      where: { role },
    });
  }

  async findOne(id: string) {
    return this.databaseService.employee.findUnique({ where: { id } });
  }

  async findOneWithUsername(username: string) {
    return this.databaseService.employee.findUnique({
      where: { email: username },
    });
  }

  async update(id: string, updateEmployeeDto: Prisma.EmployeeUpdateInput) {
    return this.databaseService.employee.update({
      where: { id },
      data: updateEmployeeDto,
    });
  }

  async remove(id: string) {
    return this.databaseService.employee.delete({ where: { id } });
  }
}
