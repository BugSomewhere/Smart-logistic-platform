import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignRouteDto {
  @IsUUID()
  @IsNotEmpty()
  driver_id: string;

  @IsUUID()
  @IsNotEmpty()
  vehicle_id: string;
}
