import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { EmployeesService } from 'src/employees/employees.service';
import { DatabaseService } from 'src/database/database.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';

@Module({
  providers: [
    AuthService,
    DatabaseService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    EmployeesService,
  ],
  controllers: [AuthController],
  imports: [PassportModule, JwtModule.register({})],
})
export class AuthModule {}
