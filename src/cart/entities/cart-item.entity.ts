import { CartItem as PrismaCartItem } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export class CartItem implements PrismaCartItem {
  id: string;
  cartId: string;
  coffeeId: string;
  quantity: number;
  unitPrice: Decimal;
  createdAt: Date;
  updatedAt: Date;
  
  coffee?: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  subtotal?: number;
} 