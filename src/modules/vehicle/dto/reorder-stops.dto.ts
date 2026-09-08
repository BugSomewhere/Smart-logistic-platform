import { IsArray, IsUUID } from 'class-validator';

export class ReorderStopsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  stop_ids: string[];     // mảng stop IDs theo thứ tự mới
}
