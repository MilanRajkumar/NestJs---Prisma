import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload, RefreshToken } from 'src/auth/types';

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof (JwtPayload & RefreshToken) | undefined,
    context: ExecutionContext,
  ) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);
