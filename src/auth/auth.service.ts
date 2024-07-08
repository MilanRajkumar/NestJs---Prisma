import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmployeesService } from 'src/employees/employees.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Tokens } from './types';
import { DatabaseService } from 'src/database/database.service';
import { AuthDto } from './dto';
import { ConfigService } from '@nestjs/config';

const saltOrRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly employeesService: EmployeesService,
    private readonly jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    private readonly config: ConfigService,
  ) {}

  async login(authDto: AuthDto) {
    try {
      const validUser = await this.validateUser(authDto.username);
      await this.validatePassword(authDto.password, validUser.password);

      const tokens = await this.getTokens({
        id: validUser.id,
        role: validUser.role,
        name: validUser.name,
        email: validUser.email,
      });
      await this.updateRefreshToken(validUser.email, tokens.refreshToken);
      return {
        ...validUser,
        ...tokens,
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(email: string): Promise<boolean> {
    await this.databaseService.employee.updateMany({
      where: {
        email: email,
        refreshToken: {
          not: null,
        },
      },
      data: {
        refreshToken: null,
      },
    });
    return true;
  }

  async refreshTokens(email: string, rt: string): Promise<Tokens> {
    const user = await this.databaseService.employee.findUnique({
      where: {
        email: email,
      },
    });
    console.log(user);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(user.refreshToken, rt);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });
    await this.updateRefreshToken(user.email, tokens.refreshToken);

    return tokens;
  }

  async updateRefreshToken(email: string, rt: string): Promise<void> {
    const hash = await bcrypt.hash(rt, saltOrRounds);

    await this.databaseService.employee.update({
      where: { email },
      data: {
        refreshToken: hash,
      },
    });
  }

  async validateUser(username: string) {
    const user = await this.employeesService.findOneWithUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async validatePassword(inputPassword: string, actuallPassword: string) {
    const _password = await bcrypt.compare(inputPassword, actuallPassword);
    if (!_password) {
      throw new NotFoundException('Invalid password');
    }

    return _password;
  }

  async getTokens(jwtPayload: JwtPayload): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIREIN'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_TOKEN_EXPIREIN'),
      }),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }
}
