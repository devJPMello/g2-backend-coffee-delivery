import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';

@Injectable()
export class CoffeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const coffees = await this.prisma.coffee.findMany({
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return coffees.map((coffee) => ({
      ...coffee,
      tags: coffee.tags.map((t) => t.tag.name),
    }));
  }

  async findOne(id: string) {
    const coffee = await this.prisma.coffee.findUnique({
      where: { id },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!coffee) throw new NotFoundException('Café não encontrado');

    return {
      ...coffee,
      tags: coffee.tags.map((t) => t.tag.name),
    };
  }

  async create(dto: CreateCoffeeDto) {
    const coffee = await this.prisma.coffee.create({
      data: {
        name: dto.name,
        description: dto.description,
        price: dto.price,
        imageUrl: dto.imageUrl,
        tags: {
          create: dto.tags.map((tagName) => ({
            tag: { connect: { name: tagName } },
          })),
        },
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return {
      ...coffee,
      tags: coffee.tags.map((t) => t.tag.name),
    };
  }

  async update(id: string, dto: Partial<CreateCoffeeDto>) {
    const existing = await this.prisma.coffee.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Café não encontrado');

    if (dto.tags) {
      await this.prisma.coffeeTag.deleteMany({ where: { coffeeId: id } });
    }

    const updated = await this.prisma.coffee.update({
      where: { id },
      data: {
        // Atualiza só os campos definidos no dto
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),

        tags: dto.tags
          ? {
              create: dto.tags.map((tagName) => ({
                tag: { connect: { name: tagName } },
              })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
      },
    });

    return {
      ...updated,
      tags: updated.tags.map((t) => t.tag.name),
    };
  }

  async remove(id: string) {
    const existing = await this.prisma.coffee.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Café não encontrado');

    await this.prisma.coffee.delete({ where: { id } });
  }

  async filterAdvanced(filters: {
    name?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) {
    const { name, minPrice, maxPrice, tags, startDate, endDate, page, limit } = filters;

    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag: {
            name: { in: tags },
          },
        },
      };
    }

    const skip = (page - 1) * limit;

    const [total, coffees] = await Promise.all([
      this.prisma.coffee.count({ where }),
      this.prisma.coffee.findMany({
        where,
        skip,
        take: limit,
        include: {
          tags: { include: { tag: true } },
        },
      }),
    ]);

    return {
      filters: { name, minPrice, maxPrice, tags, startDate, endDate },
      meta: {
        totalItems: total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      data: coffees.map((coffee) => ({
        ...coffee,
        tags: coffee.tags.map((t) => t.tag.name),
      })),
    };
  }
}
