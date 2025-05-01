import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { or } from "sequelize";
// somewhere in your initialization file

async function bootstrap() {
  try {
    const PORT = process.env.PORT || 3030;
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix("api");

    app.enableCors({
      origin: (origin, callback) => {
        const allowOrigin = [
          "http://localhost:8000",
          "http://localhost:3000",
          "http://skidkachi.uz",
          "http://api.skidkachi.uz",
          "http://skidkachi.versal.app",
        ];
        if (!origin || allowOrigin.includes(origin)) {
          callback(null, true);
        } else {
          callback(new BadRequestException("Not allow Cors"));
        }
      },
      methods: "GET,PUT,PATCH,POST,DELETE",
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle("Skidkachi project")
      .setDescription("Skidkachi REST API")
      .setVersion("1.0")
      .addTag("Nestjs", "Validation")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api/docs", app, document);
    app.use(cookieParser());
    await app.listen(PORT, () => {
      console.log(`sercewgffdsf ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}
bootstrap();
