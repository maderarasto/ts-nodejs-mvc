"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const DB_1 = __importDefault(require("./database/DB"));
const config_1 = __importDefault(require("./config"));
const Model_1 = __importDefault(require("./models/Model"));
const User_1 = __importDefault(require("./models/User"));
const app = (0, express_1.default)();
app.get('/', function (req, res) {
    res.send('Hello World');
});
app.use(express_1.default.json());
app.listen(config_1.default.port, async () => {
    console.log(`App is listening on port ${config_1.default.port}...`);
    DB_1.default.init();
    await Model_1.default.find(1);
    await User_1.default.find(1);
});
