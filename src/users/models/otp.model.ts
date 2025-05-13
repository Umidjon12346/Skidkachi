import { Table, Column, DataType, Model } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface OtpCreationAttr {
  id: string;
  phone_number: string;
  otp: string;
  expiration_time: Date;
}

@Table({ tableName: "otp" })
export class OtpModel extends Model<OtpModel, OtpCreationAttr> {
  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    description: "Unique identifier for the OTP record",
  })
  @Column({
    type: DataType.UUID,
    primaryKey: true,
  })
  declare id: string;

  @ApiProperty({
    example: "+123456789",
    description: "Phone number associated with the OTP",
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare phone_number: string;

  @ApiProperty({
    example: "123456",
    description: "The OTP code",
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare otp: string;

  @ApiProperty({
    example: "2025-05-06T12:00:00Z",
    description: "Expiration time of the OTP",
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expiration_time: Date;
  @Column({
    type:DataType.BOOLEAN,
    defaultValue:false
  })
  declare verified:boolean
}
