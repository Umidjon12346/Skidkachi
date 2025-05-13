import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./models/user.model";
import * as bcrypt from "bcrypt";
import { MailService } from "../mail/mail.service";
import { where } from "sequelize";
import { PhoneUserDto } from "./dto/phone-user.dto";
import * as otpGenerator from "otp-generator";
import { BotService } from "../bot/bot.service";
import * as uuid from "uuid";
import { OtpModel } from "./models/otp.model";
import { AddMinutesToDate } from "../common/helpers/addMinutes";
import { decode, encode } from "../common/helpers/crypto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(OtpModel) private readonly otpModel: typeof OtpModel,
    private readonly mailService: MailService,
    private readonly botService: BotService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, confirm_password } = createUserDto;
    if (password != confirm_password) {
      throw new BadRequestException("xatoo paril");
    }
    const hashed_password = await bcrypt.hash(password, 7);

    const newUser = await this.userModel.create({
      ...createUserDto,
      hashed_password,
    });
    console.log(newUser.email);

    try {
      await this.mailService.sendMail(newUser);
    } catch (error) {
      console.log(error);
      throw new ServiceUnavailableException("Email xat yuborishda xatoo");
    }
    return newUser;
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  // async findByRefresh(refresh_token: string) {
  //   const users = await this.userModel.findAll();

  //   for (const user of users) {
  //     const match = await bcrypt.compare(
  //       refresh_token,
  //       user.dataValues.hashed_refresh_token
  //     );
  //     if (match) return user;
  //   }

  //   return null;
  // }

  findAll() {
    return this.userModel.findAll();
  }

  findOne(id: number) {
    return this.userModel.findOne({ where: { id } });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
  async updateRefreshToekn(id: number, hashed_refresh_token: string) {
    const updatedUser = await this.userModel.update(
      { hashed_refresh_token },
      { where: { id } }
    );
    return updatedUser;
  }

  remove(id: number) {
    return this.userModel.destroy({ where: { id } });
  }

  async activateUser(link: string) {
    if (!link) {
      throw new BadRequestException("Activation link not found");
    }
    const updatedUser = await this.userModel.update(
      { is_active: true },
      { where: { activation_link: link, is_active: true }, returning: true }
    );
    if (!updatedUser[1][0]) {
      throw new BadRequestException("user already activated");
    }
    return {
      message: "User activated",
      is_active: updatedUser[1][0].is_active,
    };
  }



  
  async newOtp(phoneUserDto: PhoneUserDto) {
    const phone_number = phoneUserDto.phone;
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    //-----------------------BOT-------------------------------------
    const isSend = await this.botService.sendOtp(phone_number, otp);
    if (!isSend) {
      throw new BadRequestException("Avval royxatdan ot");
    }
    // return {message:"OTP yuborildi"}
    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 5);
    await this.otpModel.destroy({ where: { phone_number } });
    const newOtpData = await this.otpModel.create({
      id: uuid.v4(),
      otp,
      phone_number,
      expiration_time,
    });
    const details = {
      timestamp: now,
      phone_number,
      otp_id: newOtpData.id,
    };
    const encodedData = await encode(JSON.stringify(details));
    return {
      message: "OTP yuborildi",
      verification_key: encodedData,
    };

    //-----------------------SMS-------------------------------------
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { verification_key, phone: phone_number, otp } = verifyOtpDto;

    const currentDate = new Date();
    const decodedData = await decode(verification_key);
    const details = JSON.parse(decodedData);
    if (details.phone_number != phone_number) {
      throw new BadRequestException("telefon yuborma");
    }
    const resultOtp = await this.otpModel.findByPk(details.otp_id);

    if (resultOtp == null) {
      throw new BadRequestException("bunday yoq");
    }
    if (resultOtp.verified) {
      throw new BadRequestException("teksirilhgna");
    }
    if (resultOtp.expiration_time < currentDate) {
      throw new BadRequestException("vaqt yoq");
    }
    if (resultOtp.otp != otp) {
      throw new BadRequestException("mos emsaa");
    }
    const user = await this.userModel.update(
      {
        is_owner: true,
      },
      { where: { phone: phone_number }, returning: true }
    );

    if(!user[1][0]){
      throw new BadRequestException("raqam yoq");
    }
    await this.otpModel.update(
      {verified:true},
      {where:{id:details.otp_id}}
    )
    return {message:"owner sean"}
  }
}
