import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';
import { Request } from 'express';

interface JwtPayloadUser {
  username: string;
  sub: number;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayloadUser;

    // console.log('RolesGuard - user:', user);
    // console.log('RolesGuard - user.role:', user?.role);
    // console.log('RolesGuard - requiredRoles:', requiredRoles);

    if (!user || !user.role) {
      throw new ForbiddenException('Доступ запрещен: отсутствуют данные пользователя');
    }

    const hasRole = requiredRoles.some((role) => user.role.toLowerCase() === role.toLowerCase());

    if (!hasRole) {
      throw new ForbiddenException(
        `Доступ запрещен: требуется одна из ролей [${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
