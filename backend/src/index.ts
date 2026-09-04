import "dotenv/config"

import { app } from "./app.js";
import { ENV } from "./env.js";

app.listen(ENV.PORT || 8000, () => {
    console.log("Server is running on port 8000");
});
