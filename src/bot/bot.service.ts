import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "./model/bot.model";
import { InjectBot } from "nestjs-telegraf";
import { BOT_NAME } from "../app.constants";
import { Context, Markup, Telegraf } from "telegraf";
import { Address } from "./model/address.model";
import { Op } from "sequelize";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Address) private readonly addressModel: typeof Address,
    @InjectBot(BOT_NAME) private readonly bot: Telegraf<Context>
  ) {}

  async start(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await this.botModel.create({
          user_id: user_id!,
          user_name: ctx.from?.username!,
          first_name: ctx.from?.first_name!,
          last_name: ctx.from?.last_name!,
          lang: ctx.from?.language_code!,
        });
        await ctx.replyWithHTML("<b>Telefonni yuborasanmi yoqmi</b>", {
          ...Markup.keyboard([
            [Markup.button.contactRequest("Telefonni yuborasanmi yoqmi")],
          ])
            .oneTime()
            .resize(),
        });
      } else if (!user.status || !user.phone_number) {
        await ctx.replyWithHTML("<b>Telefonni yuborasanmi yoqmi</b>", {
          ...Markup.keyboard([
            [Markup.button.contactRequest("Telefonni yuborasanmi yoqmi")],
          ])
            .oneTime()
            .resize(),
        });
      } else {
        await ctx.replyWithHTML("bu botda", { ...Markup.removeKeyboard() });
      }
    } catch (error) {
      console.log("errorr start", error);
    }
  }

  async onContact(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await ctx.replyWithHTML("<b>/start ni bosssssssss</b>", {
          ...Markup.keyboard([["/start"]])
            .oneTime()
            .resize(),
        });
      } else if (user.phone_number) {
        await ctx.replyWithHTML("<b>borsanku yan otamn deydiya</b>", {
          ...Markup.removeKeyboard(),
        });
      } else if (
        "contact" in ctx.message! &&
        ctx.message.contact.user_id != user_id
      ) {
        await ctx.replyWithHTML("<b>Ozingnikini jonattt</b>", {
          ...Markup.keyboard([
            [Markup.button.contactRequest("Telefonni yuborasanmi yoqmi")],
          ])
            .oneTime()
            .resize(),
        });
      } else if ("contact" in ctx.message!) {
        let phone = ctx.message.contact.phone_number;
        if (phone[0] != "+") {
          phone = "+" + phone;
        }
        user.phone_number = phone;
        user.status = true;
        await user.save();
        await ctx.replyWithHTML("<b>rayxatdan otdinga bottt</b>", {
          ...Markup.keyboard([
            [Markup.button.locationRequest("locationni tasga")],
          ])
            .oneTime()
            .resize(),
        });
      }
    } catch (error) {
      console.log("Errorr onContact", error);
    }
  }
  async onStop(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await ctx.replyWithHTML("<b>/start ni bosssssssss</b>", {
          ...Markup.keyboard([["/start"]])
            .oneTime()
            .resize(),
        });
      } else if (user.status) {
        user.status = false;
        user.phone_number = "";
        await user.save();
        await ctx.replyWithHTML(
          "<b>Sen vaqtincha chiqding qayta kirmoqchimisan startni bossssss</b>",
          {
            ...Markup.keyboard([["/start"]])
              .oneTime()
              .resize(),
          }
        );
      }
    } catch (error) {
      console.log("errorr onStop", error);
    }
  }
  async sendOtp(phone_number: string, OTP: string) {
    try {
      const user = await this.botModel.findOne({ where: { phone_number } });
      if (!user || !user.status) {
        return false;
      }
      await this.bot.telegram.sendMessage(user.user_id, `Verify ${OTP}`);
      return true;
    } catch (error) {
      console.log("eeeeeeeeee", error);
    }
  }

  async onLocation(ctx: Context) {
    try {
      if ("location" in ctx.message!){
        const user_id = ctx.from?.id;
        const user = await this.botModel.findByPk(user_id);
        if (!user) {
          await ctx.replyWithHTML("<b>/start ni bosssssssss</b>", {
            ...Markup.keyboard([["/start"]])
              .oneTime()
              .resize(),
          });
      }else{
        const address = await this.addressModel.findOne({
          where: {
            user_id,
            last_state: { [Op.ne]: "finish" },
          },
          order: [["id", "DESC"]],
        });
        if(address && address.last_state == "location"){
          address.location = `${ctx.message.location.latitude},${ctx.message.location.longitude}`;
          address.last_state = "finish"
          await address.save()
          await ctx.reply("Manzil saqlandi", {
            parse_mode: "HTML",
            ...Markup.keyboard([
              ["Mening manzillarim", "Ynagi manzil"],
            ]).resize(),
          });
        }
      }
    }} catch (error) {
      console.log("Onla",error)
    }
  }

  async onUserInfo(ctx: Context) {
    try {
      if ("text" in ctx.message! && ctx.message!.text === "📄 User haqida") {
        const user_id = ctx.from?.id;
        const user = await this.botModel.findByPk(user_id);

        if (!user) {
          return ctx.replyWithHTML(
            "<b>Foydalanuvchi topilmadi. Iltimos, /start buyrug‘ini bosing.</b>",
            {
              ...Markup.keyboard([["/start"]])
                .oneTime()
                .resize(),
            }
          );
        }

        if (!user.location) {
          return ctx.reply("Siz hali joylashuv yubormagansiz.");
        }

        // Agar joylashuv JSON tarzida saqlangan bo‘lsa (location: string)
        const location = JSON.parse(user.location); // yoki user.location_lat va user.location_lng bo‘lsa, shu orqali foydalaning

        const text = `<b>👤 Ism:</b> ${ctx.from?.first_name}
<b>🆔 Telegram ID:</b> ${user_id}
<b>📍 Joylashuv:</b> ${location.latitude}, ${location.longitude}
<a href="https://maps.google.com/?q=${location.latitude},${location.longitude}">📌 Google xaritada ochish</a>`;

        await ctx.replyWithHTML(text, {
          reply_markup: {
            remove_keyboard: true,
          },
        });
      }
    } catch (error) {
      console.error("Xatolik 📄 User haqida tugmasida:", error);
      await ctx.reply("Xatolik yuz berdi.");
    }
  }

  async onText(ctx: Context) {
    if ("text" in ctx.message!) {
      try {
        const user_id = ctx.from?.id;
        const user = await this.botModel.findByPk(user_id);
        if (!user) {
          await ctx.replyWithHTML("<b>/start ni bosssssssss</b>", {
            ...Markup.keyboard([["/start"]])
              .oneTime()
              .resize(),
          });
        } else {
          const address = await this.addressModel.findOne({
            where:{
              user_id,
              last_state:{[Op.ne]: "finish"},
            },
            order:[["id","DESC"]]
          });
          if(address){
            const userInput = ctx.message.text
            switch(address.last_state){
              case "name":
                address.name = userInput
                address.last_state = "address"
                await address.save()
                await ctx.reply("MAnzilni kirit",{
                  parse_mode:"HTML",
                  ...Markup.removeKeyboard()
                })
                break;

              case "address":
                address.address = userInput
                address.last_state = "location"
                await address.save()
                await ctx.reply("Manzil lokatsiyasini tasha",{
                  ...Markup.keyboard([[Markup.button.locationRequest("lokatsiya tasha")]]).resize()
                })
                break
            }
          }
        }
      } catch (error) {
        console.log("error OnText", error);
      }
    }
  }
}
