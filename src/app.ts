import "reflect-metadata";

import { __, ifElse, lte, tap } from "ramda";
import { createExpressServer, useContainer } from "routing-controllers";
import { Container } from "typedi";
import { createConnection, useContainer as ormUseContainer } from "typeorm";
import { PhonebookController } from "./controllers/PhonebookController";
import { UserController } from "./controllers/UserController";

const MAX_RETRIES = 10;

useContainer(Container);
ormUseContainer(Container);

const expressApp = createExpressServer({
  controllers: [
    PhonebookController,
    UserController,
  ],
});

const canRetryConnect = (nthRetry: number) => () => lte(nthRetry, MAX_RETRIES);
const rejectConnect = (e: Error) => Promise.reject(e);
const execWithTimeout = (f: () => any, timeout = 2000) => (
  () => new Promise((resolve) => setTimeout(() => resolve(f()), timeout))
);

const connect = (nthRetry = 1): Promise<any> => (
  createConnection().catch(
    ifElse(
      canRetryConnect(nthRetry),
      tap(
        () => console.log(`Couldn't connect to db, retry ${nthRetry}/${MAX_RETRIES}...`),
        execWithTimeout(() => connect(nthRetry + 1)),
      ),
      rejectConnect,
    ),
  )
);

connect().then(() => {
  expressApp.listen(3000);
  console.log("App running on port 3000");
}).catch((e) => console.error("Error caught on connect: ", e));
