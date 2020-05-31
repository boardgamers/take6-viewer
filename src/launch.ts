import { EventEmitter } from 'events';
import Root, { store } from "./Root";
import { createRoot } from '@hex-engine/2d';

function launch() {
  let created = false;
  let player: number = 0;

  const item: EventEmitter = new EventEmitter();

  item.addListener("state", data => {
    if (!created) {
      createRoot(() => Root(data, player, false));
      created = true;

      store.logic!.on("move", move => item.emit("move", move));
    } else {
      store.logic!.overwrite(data)
    }
  });
  item.addListener("state:updated", () => item.emit("fetchLog", {start: Math.max(store.logic!.state.log.length - 4, 0)}));
  item.addListener("player", data => {
    console.log("setting player to", data.index);
    player = data.index;

    if (store.logic) {
      store.logic.player = data.index;
    }
  });
  item.addListener("gamelog", logData => store.logic!.updateLog({start: logData.start, log: logData.data.log, availableMoves: logData.data.availableMoves}));

  return item;
}

export default launch;