import { HELLO2 } from "../export-barrels";
import * as X from "../export-barrels";
import { HELLO_ONE } from "../export-barrels/nested-exports-with-index/1-A-nested-export";

import * as lodash from "lodash";

const hello1 = new HELLO_ONE();
const hello2 = new HELLO2();
