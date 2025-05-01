import { Body, Controller, Param, ParseIntPipe, Post, Req, Res } from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { SignInDto } from "./dto/sign-in.dto";
import { Response } from "express";
import { CookieGetter } from "../common/decorators/cookie-getter.decorator";
import { CreateAdminDto } from "../admin/dto/create-admin.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.authService.signUp(createUserDto);
  }

  @Post("sign-in")
  async signIn(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signIn(signInDto, res);
  }

  @Post("sign-out")
  async signOut(
    @CookieGetter("refresh_token") refresh_token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signOut(refresh_token, res);
  }
  @Post(":id/refresh")
  async userRefreshToken(
    @Param("id", ParseIntPipe) id: number,
    @CookieGetter("refresh_token") refresh_token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.userRefreshToken(id, refresh_token, res);
  }
  ////===========================admin==========================================
  @Post("admin/sign-up")
  async signUpAdmin(@Body() createadminDto: CreateAdminDto) {
    return this.authService.signUpAdmin(createadminDto);
  }

  @Post("admin/sign-in")
  async signInAdmin(
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signInAdmin(signInDto, res);
  }

  @Post("admin/sign-out")
  async signOutAdmin(
    @CookieGetter("admin_refresh_token") refresh_token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.signOutAdmin(refresh_token, res);
  }
  @Post("admin/:id/refresh")
  async adminRefreshToken(
    @Param("id", ParseIntPipe) id: number,
    @CookieGetter("refresh_token") refresh_token: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.adminRefreshToken(id, refresh_token, res);
  }
}
