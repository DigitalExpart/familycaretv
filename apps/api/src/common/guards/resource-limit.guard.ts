import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SubscriptionsService } from '../../subscriptions/subscriptions.service';
import { ResourceKey } from '../config/plan-limits.config';

export const RESOURCE_TYPE_KEY = 'resourceType';

/**
 * Decorator to mark an endpoint with the resource type it creates.
 * Used in conjunction with ResourceLimitGuard.
 * 
 * Example: @ResourceType('patients')
 */
export function ResourceType(type: ResourceKey) {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(RESOURCE_TYPE_KEY, type, descriptor.value);
    }
    return descriptor;
  };
}

/**
 * Guard that checks resource count limits per plan tier before allowing creation.
 * Only blocks POST requests. Uses the @ResourceType() decorator to determine which resource.
 */
@Injectable()
export class ResourceLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Only enforce on creation (POST)
    if (request.method !== 'POST') return true;

    const user = request.user;
    if (!user) return true; // Let JwtAuthGuard handle

    // Admin accounts have unlimited access and bypass all resource limits
    if (user.role === 'ADMIN') return true;

    const resourceType = this.reflector.get<ResourceKey>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    // If no @ResourceType decorator, skip
    if (!resourceType) return true;

    const userId = user.id || user.userId;
    const result = await this.subscriptionsService.checkResourceLimit(userId, resourceType);

    if (!result.allowed) {
      throw new ForbiddenException(result.message);
    }

    return true;
  }
}
