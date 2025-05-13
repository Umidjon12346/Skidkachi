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
import { BotService } from "./bot.service";

@Update()
export class BotUpdate {
  constructor(private readonly botService: BotService) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    return this.botService.start(ctx);
  }

  @On("contact")
  async onStiker(@Ctx() ctx: Context) {
    return this.botService.onContact(ctx);
  }
  @On("location")
  async onLocation(@Ctx() ctx: Context) {
    return this.botService.onLocation(ctx);
  }
  @Command("stop")
  async onStop(@Ctx() ctx: Context) {
    return this.botService.onStop(ctx);
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    return this.botService.onText(ctx)
  }

  // @On("message")
  // async onMessage(@Ctx() ctx: Context) {
  //   console.log(ctx.botInfo);
  //   console.log(ctx.chat);
  //   console.log(ctx.chat!.id);
  //   console.log(ctx.from);
  //   console.log(ctx.from!.id);
  // }
}
