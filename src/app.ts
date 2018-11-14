import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { PhoneBookController } from "./controllers/PhoneBookController";

useContainer(Container);

const expressApp = createExpressServer({
  controllers: [
    PhoneBookController
  ]
});

expressApp.listen(3000);

console.log("Server is up and running at port 3000");