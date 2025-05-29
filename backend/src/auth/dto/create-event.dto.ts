
export class CreateEventDto {
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  maxParticipants?: number;
  type?: string;
  price?: number;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  photos?: string[];
}
 