import config from "./config";
import Application from "./framework/Core/Application";

const app = new Application(config);
app.start();