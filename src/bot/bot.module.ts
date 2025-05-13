import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { SequelizeModule } from "@nestjs/sequelize";
import { Bot } from "./model/bot.model";
import { Address } from "./model/address.model";
import { AddressUpdate } from "./address/address.update";
import { AddressService } from "./address/address.service";

@Module({
  imports:[SequelizeModule.forFeature([Bot,Address])],
  controllers: [],
  providers: [BotService,AddressService,AddressUpdate, BotUpdate],
  exports:[BotService]
})
export class BotModule {}
