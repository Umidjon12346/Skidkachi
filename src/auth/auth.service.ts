import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { User } from "../users/models/user.model";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Admin } from "../admin/models/admin.model";
import { AdminService } from "../admin/admin.service";
import { CreateAdminDto } from "../admin/dto/create-admin.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService
  ) {}

  async generateTokens(user: User) {
    const payload = {
      id: user.id,
      is_active: user.is_active,
      is_owner: user.is_owner,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async generateAdminTokens(admin: Admin) {
    const payload = {
      id: admin.id,
      is_active: admin.is_active,
      is_creator: admin.is_creator,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async signUp(createUserDto: CreateUserDto) {
    const candidate = await this.usersService.findByEmail(createUserDto.email);
    if (candidate) {
      throw new ConflictException("bunday emailli foydalanuvchi bor");
    }

    const newUser = await this.usersService.create(createUserDto);
    return { message: "Foydalanuvchi qoshildida", userId: newUser.id };
  }

  async signIn(signIndto: SignInDto, res: Response) {
    const user = await this.usersService.findByEmail(signIndto.email);
    if (!user) {
      throw new BadRequestException("Email yoki password");
    }
    // if (!user.is_active) {
    //   throw new BadRequestException("Email tashdiqla");
    // }
    const isValid = await bcrypt.compare(
      signIndto.password,
      user.dataValues.hashed_password
    );
    if (!isValid) {
      throw new BadRequestException("Email yoki password");
    }
    const { accessToken, refreshToken } = await this.generateTokens(user);

    res.cookie("refresh_token", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    try {
      user.hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
      await user.save();
    } catch (error) {
      console.error("Tokenni saqlashda xatolik:", error);
    }

    return { message: "xush kormin", accessToken };
  }

  async signOut(refresh_token: string, res: Response) {
    const userData = this.jwtService.verify(refresh_token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    if (!userData) {
      throw new ForbiddenException("user not");
    }

    const hashed_refresh_token = null;
    await this.usersService.updateRefreshToekn(
      userData.id,
      hashed_refresh_token!
    );

    res.clearCookie("refresh_token");

    return { message: "Eson-omon chiqib olding" };
  }

  async userRefreshToken(id: number, refresh_token: string, res: Response) {
    const decodedToken = await this.jwtService.decode(refresh_token);

    if (id !== decodedToken.id) {
      throw new ForbiddenException("Foydalanuvchi topilmadi");
    }
    const user = await this.usersService.findOne(id);
    if (!user || !user.hashed_refresh_token) {
      throw new ForbiddenException("Foydalanuvchi topilmadi");
    }
    const match = await bcrypt.compare(
      refresh_token,
      user.hashed_refresh_token
    );
    if (!match) {
      throw new ForbiddenException("Refresh token mos emas");
    }

    const tokens = await this.generateTokens(user);

    user.hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);
    await user.save();

    res.cookie("refresh_token", tokens.refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    return { accessToken: tokens.accessToken };
  }

  /////===========================================Admin===================================================================================
  async signUpAdmin(createAdminDto: CreateAdminDto) {
    const candidate = await this.adminService.findByEmail(createAdminDto.email);
    if (candidate) {
      throw new ConflictException("bunday emailli foydalanuvchi bor");
    }

    const newadmin = await this.adminService.create(createAdminDto);
    return { message: "Foydalanuvchi qoshildida", adminId: newadmin.id };
  }

  async signInAdmin(signIndto: SignInDto, res: Response) {
    const admin = await this.adminService.findByEmail(signIndto.email);
    if (!admin) {
      throw new BadRequestException("Email yoki password");
    }
    const isValid = await bcrypt.compare(
      signIndto.password,
      admin.dataValues.hashed_password
    );
    if (!isValid) {
      throw new BadRequestException("Email yoki password");
    }
    const { accessToken, refreshToken } = await this.generateAdminTokens(admin);

    res.cookie("admin_refresh_token", refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    try {
      admin.hashed_refresh_token = await bcrypt.hash(refreshToken, 7);
      await admin.save();
    } catch (error) {
      console.error("Tokenni saqlashda xatolik:", error);
    }

    return { message: "xush korminb", accessToken };
  }

  async signOutAdmin(refresh_token: string, res: Response) {
    const userData = this.jwtService.verify(refresh_token, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });
    if (!userData) {
      throw new ForbiddenException("user not");
    }

    const hashed_refresh_token = null;
    await this.adminService.updateRefreshToekn(
      userData.id,
      hashed_refresh_token!
    );

    res.clearCookie("admin_refresh_token");

    return { message: "Eson-omon chiqib olding" };
  }

  async adminRefreshToken(id: number, refresh_token: string, res: Response) {
    const decodedToken = await this.jwtService.decode(refresh_token);

    if (id !== decodedToken.id) {
      throw new ForbiddenException("Foydalanuvchi topilmadi");
    }
    const admin = await this.adminService.findOne(id);
    if (!admin || !admin.hashed_refresh_token) {
      throw new ForbiddenException("Foydalanuvchi topilmadi");
    }
    const match = await bcrypt.compare(
      refresh_token,
      admin.hashed_refresh_token
    );
    if (!match) {
      throw new ForbiddenException("Refresh token mos emas");
    }

    const tokens = await this.generateAdminTokens(admin);

    admin.hashed_refresh_token = await bcrypt.hash(tokens.refreshToken, 7);
    await admin.save();

    res.cookie("admin_refresh_token", tokens.refreshToken, {
      maxAge: Number(process.env.COOKIE_TIME),
      httpOnly: true,
    });

    return { accessToken: tokens.accessToken };
  }
}
