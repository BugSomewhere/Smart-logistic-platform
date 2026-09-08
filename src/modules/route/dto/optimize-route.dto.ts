import { IsDateString } from 'class-validator';

export class OptimizeRouteDto {
  @IsDateString()
  route_date: string;
}
