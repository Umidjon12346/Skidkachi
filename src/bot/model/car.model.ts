import { Table, Column, DataType, Model } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface ICarCreationAttr {
  model: string;
  brand: string;
  color: string;
  number_plate: string;
  year: number;
}

@Table({ tableName: "cars" })
export class Car extends Model<Car, ICarCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ApiProperty({ example: "Malibu", description: "Car model" })
  @Column({
    type: DataType.STRING,
  })
  declare model: string;

  @ApiProperty({ example: "Chevrolet", description: "Car brand" })
  @Column({
    type: DataType.STRING,
  })
  declare brand: string;

  @ApiProperty({ example: "Black", description: "Car color" })
  @Column({
    type: DataType.STRING,
  })
  declare color: string;

  @ApiProperty({ example: "01A123BC", description: "Car number plate" })
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  declare number_plate: string;

  @ApiProperty({ example: 2022, description: "Car year" })
  @Column({
    type: DataType.INTEGER,
  })
  declare year: number;
}
