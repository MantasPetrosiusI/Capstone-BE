import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import server from "./server";

const port = process.env.PORT || 3001;

if (process.env.MONGO_URL) {
  mongoose.connect(process.env.MONGO_URL as string);
}

mongoose.connection.on("connected", () => {
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server listening on port ${port}`);
  });
});
