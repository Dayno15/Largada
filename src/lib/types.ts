export type Role = 'atleta' | 'organizador' | 'admin';
export type EventStatus = 'Inscrições abertas' | 'Em breve' | 'Encerrado' | 'Rascunho';
export type PaymentStatus = 'Confirmada' | 'Pendente' | 'Cancelada';
export type Sport = 'Corrida de Rua' | 'MTB' | 'Ciclismo' | 'Trail Run' | 'Triathlon';
export interface Distance {
  name: string;
  price: number;
  capacity: number;
}
export interface EventResult {
  pos: number;
  name: string;
  distance: string;
  category: string;
  time: string;
  pace: string;
}
export interface RaceEvent {
  id: string;
  name: string;
  subtitle: string;
  sport: Sport;
  date: string;
  time: string;
  city: string;
  state: string;
  venue: string;
  image: string;
  status: EventStatus;
  organizerId: string;
  distances: Distance[];
  description: string;
  capacity: number;
  serviceFee: number;
  feePayer: 'atleta' | 'organizador';
  installments: number;
  kitPickup: string;
  shirt: boolean;
  publicList: boolean;
  registrationEnd: string;
  registrationStart?: string;
  whatsapp?: string;
  strava?: string;
  results?: EventResult[];
  createdAt: string;
  featured?: boolean;
}
export interface Athlete {
  name: string;
  email: string;
  cpf: string;
  birth: string;
  sex: string;
  phone: string;
  city: string;
  state: string;
  team: string;
  emergency: string;
}
export interface Registration extends Athlete {
  id: string;
  eventId: string;
  distance: string;
  category: string;
  shirt: string;
  kit: string;
  kitExtra: number;
  partner: string;
  notes: string;
  status: PaymentStatus;
  method: 'PIX' | 'Cartão' | 'Boleto';
  amount: number;
  fee: number;
  discount: number;
  coupon: string;
  createdAt: string;
  paidAt: string;
  bib: string;
  kitDelivered: boolean;
  installments: number;
}
export interface Organizer {
  id: string;
  name: string;
  contact: string;
  email: string;
  city: string;
  status: 'Aprovado' | 'Pendente';
}
export interface Transfer {
  id: string;
  eventId: string;
  amount: number;
  date: string;
  status: 'Programado' | 'Recebido';
  bank: string;
}
export interface Coupon {
  id: string;
  eventId: string;
  code: string;
  type: 'percentual' | 'fixo';
  value: number;
  limit: number;
  used: number;
  expires: string;
  active: boolean;
}
export interface Activity {
  id: string;
  text: string;
  date: string;
  actor: string;
}
export interface Session {
  role: Role;
  name: string;
  email: string;
  cpf?: string;
  organizerId?: string;
}
export interface Database {
  version: number;
  events: RaceEvent[];
  registrations: Registration[];
  organizers: Organizer[];
  transfers: Transfer[];
  coupons: Coupon[];
  activities: Activity[];
  profile: Athlete;
  settings: { platformName: string; email: string; fee: number; pix: string };
}
