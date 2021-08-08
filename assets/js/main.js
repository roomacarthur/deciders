// Engine Core Test code

import { Game, AssetTypes, GameStates } from "./modules/gamemanager.mjs";
import * as configs from "./config.mjs";

const game = new Game(
  document.getElementById('canvas'),
  configs.TrackConfig,
  configs.PlayerConfig,
  configs.ObjectTypes
);

// Loading code here...

game.start();