import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_WIDGET_ORDER,
  loadWidgetOrder,
  saveWidgetOrder,
} from "../src/lib/dashboard-layout.js";

function createStorage(value = null) {
  return {
    value,
    getItem() {
      return this.value;
    },
    setItem(_key, nextValue) {
      this.value = nextValue;
    },
  };
}

test("loads a complete saved widget order and rejects invalid layouts", () => {
  const savedOrder = ["location", "status", "stale", "priority"];
  const validStorage = createStorage(JSON.stringify({ version: 1, widgetOrder: savedOrder }));
  const invalidStorage = createStorage(
    JSON.stringify({ version: 1, widgetOrder: ["status", "stale", "priority"] }),
  );

  assert.deepEqual(loadWidgetOrder(validStorage), savedOrder);
  assert.deepEqual(loadWidgetOrder(invalidStorage), DEFAULT_WIDGET_ORDER);
});

test("saves widget order in the versioned dashboard layout", () => {
  const storage = createStorage();
  const widgetOrder = ["priority", "location", "status", "stale"];

  saveWidgetOrder(widgetOrder, storage);

  assert.deepEqual(JSON.parse(storage.value), { version: 1, widgetOrder });
});
