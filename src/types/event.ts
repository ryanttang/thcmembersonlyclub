export interface Event {
  id: string;
  title: string;
  description?: string | null;
  date: Date;
  startTime?: string | null;
  endTime?: string | null;
  location: string;
  ticketUrl: string;
  flyerUrl: string;
  isPublished: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}
