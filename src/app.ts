import "reflect-metadata";

import { __, gt, ifElse } from "ramda";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { createConnection, useContainer as ormUseContainer } from "typeorm";
import { PhonebookController } from "./controllers/PhonebookController";
import { UserController } from "./controllers/UserController";

useContainer(Container);
ormUseContainer(Container);

const expressApp = createExpressServer({
  controllers: [
    PhonebookController,
    UserController,
  ],
});

const canRetryConnect = ((maxRetries: number) => (nthRetry: number) => () => gt(nthRetry, maxRetries))(5);
const rejectConnect = (e: Error) => Promise.reject(e);
const execWithTimeout = (f: () => any) => () => (
  new Promise((resolve) => setTimeout(() => resolve(f()), 2000))
);

const connect = (nthRetry = 1): Promise<any> => (
  createConnection().catch(
    ifElse(
      canRetryConnect(nthRetry),
      rejectConnect,
      execWithTimeout(() => connect(nthRetry + 1)),
    ),
  )
);

connect()
  .then(() => {
    expressApp.listen(3000);
    console.log("App running on port 3000");
  })
  .catch((e) => console.error("Error caught on connect: ", e));
