import { Table, Column, DataType, Model } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface IAddressCreationAttr {
  user_id: number | undefined;
  last_state: string;
}

@Table({ tableName: "address" })
export class Address extends Model<Address, IAddressCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ApiProperty({
    example: "Home",
    description: "Name of the address (e.g., Home, Office)",
  })
  @Column({
    type: DataType.STRING,
  })
  declare name: string;

  @Column({
    type: DataType.BIGINT,
  })
  declare user_id: number;

  @ApiProperty({
    example: "123 Main St, New York, NY",
    description: "Full address",
  })
  @Column({
    type: DataType.STRING,
  })
  declare address: string;

  @ApiProperty({
    example: "40.7128, -74.0060",
    description: "Geographical location (latitude, longitude)",
  })
  @Column({
    type: DataType.STRING,
  })
  declare location: string;

  @Column({
    type: DataType.STRING,
  })
  declare last_state: string;
}
