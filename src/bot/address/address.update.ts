import {
  Action,
  Command,
  Ctx,
  Hears,
  On,
  Start,
  Update,
} from "nestjs-telegraf";
import { Context, Markup } from "telegraf";
import { button } from "telegraf/typings/markup";
import { BotService } from "../bot.service";
import { AddressService } from "./address.service";

@Update()
export class AddressUpdate {
  constructor(private readonly addressService: AddressService) {}

  @Command("address")
  async onAdress(@Ctx() ctx: Context) {
    return this.addressService.onAddress(ctx);
  }

  @Hears("Ynagi manzil")
  async onNewAddress(@Ctx() ctx: Context) {
    return this.addressService.onNewAddress(ctx);
  }
  @Hears("Mening manzillarim")
  async onMyAddress(@Ctx() ctx: Context) {
    return this.addressService.onMyAddresses(ctx);
  }

  @Action(/^loc_+\d+/)
  async onClickLocation(@Ctx() ctx: Context) {
    await this.addressService.onClickLocation(ctx);
  }

  @Action(/^del_+\d+/)
  async onClickDelete(@Ctx() ctx: Context) {
    await this.addressService.onClickDelete(ctx);
  }
}