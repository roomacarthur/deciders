// Engine Core Test code

import { Game, AssetTypes, GameStates } from "./modules/gamemanager.mjs";
import * as configs from "./config.mjs";

const game = new Game(document.getElementById('canvas'));
game.setupGame(configs.TestTrackConfig, configs.TestPlayerConfig);
game.start();