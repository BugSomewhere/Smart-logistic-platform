import { IsEnum } from "class-validator"
import { RouteStatus } from "#/generated/prisma/enums.js"

export class UpdateRouteStatusDto {
  @IsEnum(RouteStatus)
  status: RouteStatus;
}
