export class UpdateEventDto {
  title?: string;
  description?: string;
  date?: Date;
  maxParticipants?: number;
  type?: string;
  price?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
}
