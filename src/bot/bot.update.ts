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

@Update()
export class BotUpdate {
  @Start()
  async onStart(@Ctx() ctx: Context) {
    ctx.reply("salom");
  }
  @On("photo")
  async onPhoto(@Ctx() ctx: Context) {
    if ("photo" in ctx.message!) {
      console.log(ctx.message.photo);

      await ctx.replyWithPhoto(
        String(ctx.message.photo[ctx.message.photo.length - 1].file_id)
      );
    }
  }

  @On("video")
  async onVideo(@Ctx() ctx: Context) {
    if ("video" in ctx.message!) {
      console.log(ctx.message.video);

      await ctx.replyWithVideo(String([ctx.message.video.file_size]));
    }
  }
  @On("sticker")
  async onStiker(@Ctx() ctx: Context) {
    if ("sticker" in ctx.message!) {
      console.log(ctx.message.sticker);

      await ctx.replyWithSticker(String([ctx.message.sticker.file_id]));
    }
  }

  @On("animation")
  async onAnimation(@Ctx() ctx: Context) {
    if ("animation" in ctx.message!) {
      console.log(ctx.message.animation);

      await ctx.replyWithSticker(String([ctx.message.animation.file_id]));
    }
  }

  @Hears("hi")
  async onHears(@Ctx() ctx: Context) {
    await ctx.reply("fidsufisadf");
  }

  @Command("inline")
  async onInline(@Ctx() ctx: Context) {
    const inlineKeybord = [
      [
        { text: "Button 1", callback_data: "button1" },
        { text: "Button 2", callback_data: "button2" },
        { text: "Button 3", callback_data: "button3" },
      ],
      [
        { text: "Button 4", callback_data: "button4" },
        { text: "Button 5", callback_data: "button5" },
      ],
    ];

    await ctx.reply("kerakli tugma", {
      reply_markup: { inline_keyboard: inlineKeybord },
    });
  }

  @Action("button1")
  async onButton1(@Ctx() ctx: Context) {
    await ctx.reply("button 1");
  }

  @Action(/^button+\d+$/)
  async onAnyButton(@Ctx() ctx: Context) {
    if ("data" in ctx.callbackQuery!) {
      const buttonData = ctx.callbackQuery?.data;
      const number = buttonData.slice(-1);
      await ctx.reply(` button: ${number}`);
    }
  }

  @Command("main")
  async onMian(@Ctx() ctx: Context) {
    const mainKeybord = [
      ["bir", "ikki", "uch"],
      ["tort", "besh"],
    ];

    await ctx.reply("kerakli main tugma", {
      ...Markup.keyboard(mainKeybord).resize(),
    });
  }
  @Hears("bir")
  async onMainButton1(@Ctx() ctx: Context){
    await ctx.reply("main 1 bos")
  }

  @On("text")
  async onText(@Ctx() ctx: Context) {
    if ("text" in ctx.message!) {
      if (ctx.message.text == "hi") {
        await ctx.replyWithHTML("<b>Hello</b>");
      } else {
        await ctx.reply(ctx.message.text);
      }
    }
  }

  @On("message")
  async onMessage(@Ctx() ctx: Context) {
    console.log(ctx.botInfo);
    console.log(ctx.chat);
    console.log(ctx.chat!.id);
    console.log(ctx.from);
    console.log(ctx.from!.id);
  }
}
