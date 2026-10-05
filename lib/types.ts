export interface RSVP {
  id: string;
  name: string;
  email: string | null;
  photoURL: string | null;
  authMethod: "google" | "name";
  attending: "yes" | "no";
  adults: number;
  kids: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface RSVPStats {
  totalResponses: number;
  totalAttending: number;
  totalDeclined: number;
  totalAdults: number;
  totalKids: number;
  totalGuests: number;
}

export interface RSVPInput {
  name: string;
  email: string | null;
  photoURL: string | null;
  authMethod: "google" | "name";
  attending: "yes" | "no";
  adults: number;
  kids: number;
  message: string;
}
