import { EventEmitter } from 'events';
import Root, { store } from "./Root";
import { createRoot } from '@hex-engine/2d';

function launch() {
  let created = false;

  const item: EventEmitter = new EventEmitter();

  item.addListener("state", data => {
    if (!created) {
      createRoot(() => Root(data, false));
      created = true;
    } else {
      store.logic!.overwrite(data)
    }
  });
  item.addListener("state:updated", () => item.emit("fetchLog", {start: Math.max(store.logic!.state.log.length - 4, 0)}));
  item.addListener("player", data => {
    console.log("setting player to", data.index);
    store.logic!.player = data.index;
  });
  item.addListener("gamelog", logData => store.logic!.updateLog({start: logData.start, log: logData.data.log, availableMoves: logData.data.availableMoves}));

  return item;
}

export default launch;