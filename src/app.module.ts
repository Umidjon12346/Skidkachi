import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "./users/users.module";
import { User } from "./users/models/user.model";
import { AuthModule } from "./auth/auth.module";
import { MailModule } from "./mail/mail.module";
import { AdminModule } from "./admin/admin.module";
import { Admin } from "./admin/models/admin.model";
import { BotModule } from "./bot/bot.module";
import { TelegrafModule } from "nestjs-telegraf";
import { BOT_NAME } from "./app.constants";
import { DistrictModule } from "./district/district.module";
import { District } from "./district/models/district.model";
import { RegionModule } from "./region/region.module";
import { Region } from "./region/models/region.model";
import { StatusModule } from "./status/status.module";
import { StoreModule } from "./store/store.module";
import { Store } from "./store/models/store.model";
import { Status } from "./status/models/status.model";
import { StoreSocialLinkModule } from "./store_social_link/store_social_link.module";
import { DiscountsModule } from "./discounts/discounts.module";
import { CategoryModule } from "./category/category.module";
import { SocialMediaTypeModule } from "./social_media_type/social_media_type.module";
import { SocialMediaType } from "./social_media_type/models/social_media_type.model";
import { StoreSocialLink } from "./store_social_link/models/store_social_link.model";
import { Discount } from "./discounts/models/discount.model";
import { Category } from "./category/models/category.model";
import { TypeModule } from "./type/type.module";
import { Bot } from "./bot/model/bot.model";
import { OtpModel } from "./users/models/otp.model";
import { Address } from "./bot/model/address.model";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
    TelegrafModule.forRootAsync({
      botName: BOT_NAME,
      useFactory: () => ({
        token: process.env.BOT_TOKEN!,
        middlewares: [],
        include: [BotModule],
      }),
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DB,
      models: [
        User,
        Admin,
        District,
        Region,
        Store,
        Status,
        SocialMediaType,
        StoreSocialLink,
        Discount,
        Category,
        Bot,
        OtpModel,
        Address
      ],
      autoLoadModels: true,
      sync: { alter: true },
      logging: true,
    }),
    UsersModule,
    AuthModule,
    MailModule,
    AdminModule,
    BotModule,
    DistrictModule,
    RegionModule,
    StatusModule,
    StoreModule,
    StoreSocialLinkModule,
    DiscountsModule,
    CategoryModule,
    SocialMediaTypeModule,
    TypeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
