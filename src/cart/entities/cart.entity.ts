import { CartStatus, PaymentStatus } from '@prisma/client';

export class Cart {
  id: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;

  status: CartStatus;
  statusPayment: PaymentStatus;
  dataTimeCompleted: Date | null;
}
