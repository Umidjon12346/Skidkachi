import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Bot } from "../model/bot.model";
import { InjectBot } from "nestjs-telegraf";
import { BOT_NAME } from "../../app.constants";
import { Context, Markup, Telegraf } from "telegraf";
import { Address } from "../model/address.model";


@Injectable()
export class AddressService {
  constructor(
    @InjectModel(Bot) private readonly botModel: typeof Bot,
    @InjectModel(Address) private readonly addressModel: typeof Address,
  ) {}

  async onAddress(ctx: Context) {
    try {
      await ctx.replyWithHTML("Manzil boyicha kerakli tugmani bosing", {
        ...Markup.keyboard([["Mening manzillarim", "Ynagi manzil"]])
          .oneTime()
          .resize(),
      });
    } catch (error) {
      console.log("errorr onAddress", error);
    }
  }

  async onNewAddress(ctx: Context) {
    try {
      const user_id = ctx.from?.id;
      const user = await this.botModel.findByPk(user_id);
      if (!user) {
        await ctx.replyWithHTML("<b>/start ni bosssssssss</b>", {
          ...Markup.keyboard([["/start"]])
            .oneTime()
            .resize(),
        });
      }
      await this.addressModel.create({
        user_id:user_id!,
        last_state:"name",
      })
      await ctx.replyWithHTML("yangi manzilni kirit")
    } catch (error) {
      console.log("errorr onAddress", error);
    }
  }


  async onMyAddresses(ctx:Context){
    try {
      const user_id = ctx.from?.id;
    const user = await this.botModel.findByPk(user_id);
    if (!user) {
      await ctx.replyWithHTML("<b>/start ni bosssssssss</b>", {
        ...Markup.keyboard([["/start"]])
          .oneTime()
          .resize(),
      });
    }else{
      const addresses = await this.addressModel.findAll({
        where:{user_id,last_state:"finish"}
      })
      if(addresses.length == 0){
        await ctx.reply("birorta ham topilmoadi", {
          ...Markup.keyboard([["Mening manzillarim", "Ynagi manzil"]]),
        });
      }else{
        addresses.forEach(async (address)=>{
          await ctx.replyWithHTML(
            `<b>Manzil nomi</b>: ${address.name}\n Manzil: ${address.address}`,
            {
              reply_markup:{
                inline_keyboard:[[{
                  text:"loakatisonni korish",
                  callback_data:`loc_${address.id}`
                },
                {
                  text:"Manzilni ochirish",
                  callback_data:`del_${address.id}`
                }
              ]]
              }
            }
          );
        })
      }
    }
    } catch (error) {
      console.log("myad",error);
    }
  }

  async onClickLocation(ctx:Context){
    try {
      const contextAction = ctx.callbackQuery!["data"]
      const contextMessage = ctx.callbackQuery!["message"]
      const address_id = contextAction.split("_")[1]
      const address = await this.addressModel.findByPk(address_id)
      await ctx.deleteMessage(contextMessage?.message_id)
      await ctx.replyWithLocation(
        Number(address?.location?.split(",")[0]),
        Number(address?.location?.split(",")[1])
      );
    } catch (error) {
      console.log("Clicklo",error);
    }
  }

  async onClickDelete(ctx:Context){
    try {
      const contextAction = ctx.callbackQuery!["data"];

      const address_id = contextAction.split("_")[1];
      await this.addressModel.destroy({
        where:{id:address_id}
      })
      await ctx.editMessageText("manzilnifasdhjk")
    } catch (error) {
      
    }
  }
}