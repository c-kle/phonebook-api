import "reflect-metadata";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { PhonebookController } from "./controllers/PhonebookController";
import { createConnection, useContainer as ormUseContainer } from "typeorm";

useContainer(Container);
ormUseContainer(Container);

const expressApp = createExpressServer({
  controllers: [
    PhonebookController
  ]
});

createConnection().then(() => {
  expressApp.listen(3000);

  console.log("Server is up and running at port 3000");
})
