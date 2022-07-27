import express from "express";
import routes from "./routes";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
const port = 5000;

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
//console.log(rebase2)

routes(app);

