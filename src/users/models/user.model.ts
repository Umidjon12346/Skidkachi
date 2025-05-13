import { Model, Table, Column, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Region } from "../../region/models/region.model";

interface IUserCreationAttr {
  name: string;
  phone: string;
  email: string;
  hashed_password: string;
  location: string;
}

@Table({ tableName: "users" })
export class User extends Model<User, IUserCreationAttr> {
  @ApiProperty({
    example: 1,
    description: "Unique identifier for the user",
  })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ApiProperty({
    example: "John Doe",
    description: "Name of the user",
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @ApiProperty({
    example: "+123456789",
    description: "Phone number of the user",
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone: string;

  @ApiProperty({
    example: "user@example.com",
    description: "Email address of the user",
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  declare email: string;

  @ApiProperty({
    example: "hashedpassword123",
    description: "Password of the user",
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare hashed_password: string;

  @ApiProperty({
    example: "hashed_refresh_token",
    description: "Hashed refresh token for the user",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare hashed_refresh_token: string;

  @ApiProperty({
    example: true,
    description: "Indicates if the user is active",
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_active: boolean;

  @ApiProperty({
    example: false,
    description: "Indicates if the user is an owner",
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare is_owner: boolean;

  @ApiProperty({
    example: "New York, USA",
    description: "Location of the user",
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare location: string;

  @ApiProperty({
    example: "region123",
    description: "Region ID associated with the user",
  })
  @Column({
    type: DataType.STRING,
    defaultValue: DataType.UUIDV4(),
  })
  declare activation_link: string;
  @ForeignKey(() => Region)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare regionId: number;

  @BelongsTo(() => Region)
  region: Region;
}
