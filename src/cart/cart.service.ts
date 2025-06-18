import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddItemDto } from './dto/add-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getOrCreateCart(userId?: string) {
    if (userId) {
      const existingCart = await this.prisma.cart.findFirst({
        where: { userId },
        include: { items: true },
      });

      if (existingCart) return existingCart;
    }

    return this.prisma.cart.create({
      data: {
        userId: userId || null,
        status: 'AGUARDANDO_PAGAMENTO',
        statusPayment: 'PENDENTE',
      },
      include: { items: true },
    });
  }

  async getCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: { coffee: true },
        },
      },
    });

    if (!cart) throw new NotFoundException(`Carrinho ${cartId} não encontrado`);

    return cart;
  }

  async addItem(cartId: string, addItemDto: AddItemDto) {
    const { coffeeId, quantity } = addItemDto;

    if (quantity > 5) {
      throw new BadRequestException('A quantidade máxima por item é 5');
    }

    const coffee = await this.prisma.coffee.findUnique({
      where: { id: coffeeId },
    });

    if (!coffee) {
      throw new NotFoundException(`Café com ID ${coffeeId} não encontrado`);
    }


    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        coffeeId,
      },
    });

    if (existingItem) {
      throw new BadRequestException('Este café já está no carrinho');
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        coffeeId,
        quantity,
        unitPrice: coffee.price,
      },
    });
  }

  async updateItem(cartId: string, itemId: string, updateItemDto: UpdateItemDto) {
    const { quantity } = updateItemDto;

    if (quantity > 5) {
      throw new BadRequestException('A quantidade máxima por item é 5');
    }

    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId },
    });

    if (!item) {
      throw new NotFoundException(`Item ${itemId} não encontrado no carrinho`);
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }
}
