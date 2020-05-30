import { EventEmitter } from 'events';
import { logic } from "./Root";

function launch() {
  const item: EventEmitter = new EventEmitter();

  item.addListener("state", data => logic.overwrite(data));
  item.addListener("state:updated", () => item.emit("fetchLog", {start: Math.max(logic.state.log.length - 4, 0)}));
  item.addListener("player", data => logic.player = data.index);
  item.addListener("gamelog", logData => logic.updateLog({start: logData.start, log: logData.data.log, availableMoves: logData.data.availableMoves}));

  return item;
}

export default launch;