import path from "path";

const Defines = {
    ROOT_DIR: path.dirname(path.dirname(__dirname)),
    SRC_DIR: path.dirname(__dirname)
} as const;

export default Defines;