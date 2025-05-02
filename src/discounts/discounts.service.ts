import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Discount } from "./models/discount.model";
import { CreateDiscountDto } from "./dto/create-discount.dto";
import { UpdateDiscountDto } from "./dto/update-discount.dto";

@Injectable()
export class DiscountsService {
  constructor(@InjectModel(Discount) private discountModel: typeof Discount) {}

  create(createDiscountDto: CreateDiscountDto) {
    return this.discountModel.create(createDiscountDto);
  }

  findAll(): Promise<Discount[]> {
    return this.discountModel.findAll();
  }

  findOne(id: number): Promise<Discount | null> {
    return this.discountModel.findByPk(id);
  }

  async update(
    id: number,
    updateDiscountDto: UpdateDiscountDto
  ): Promise<Discount | null> {
    const [count, updated] = await this.discountModel.update(
      updateDiscountDto,
      {
        where: { id },
        returning: true,
      }
    );
    return count > 0 ? updated[0] : null;
  }

  async remove(id: number) {
    const deleted = await this.discountModel.destroy({ where: { id } });
    if (deleted > 0) {
      return "ochib olib kettii";
    }
    return "ochirmaaaa";
  }
}
