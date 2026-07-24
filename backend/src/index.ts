import "dotenv/config"

import { app } from "./app.js";

app.listen(process.env.port || 8000, () => {
    console.log("Server is running on port 8000");
});
